#!/usr/bin/env python3
"""Importa respostas agregadas e catálogo de questões para JSON compacto."""
from __future__ import annotations

import argparse, csv, hashlib, json, re, tempfile, shutil, unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import openpyxl

HEADERS = ("ano","mes","formulario_id","formulario_nome","conselho","unidade_resumida","unidade_detalhe","responsavel_id","responsavel_nome","sexo","ano_nascimento","questao_id","questao","tipo_questao","opcao_selecionada","booleano","quantidade")
UNIT_RE = re.compile(r"\[IdUnidade=(\d+)\].*?\[Unidade=(.*?)\].*?\[Situação=(.*?)\].*?\[Conselho=(.*?)\].*?\[UF=([A-Z]{2})\]$")
CITY_RE = re.compile(r"-\s*(.+?)/([A-Z]{2})$")

def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode().casefold()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()

def age(year: int, birth: str):
    if not birth or birth.upper() == "NULL": return "Não informada", "Não informada"
    try: value = int(birth)
    except ValueError: return "Inválida", "Inválida"
    years = year - value
    if value < 1900 or years < 0 or years > 110: return "Inválida", "Inválida"
    for limit, label in [(17,"Até 17"),(24,"18–24"),(34,"25–34"),(44,"35–44"),(54,"45–54"),(64,"55–64")]:
        if years <= limit: return label, "Válida"
    return "65+", "Válida"

def parse_unit(detail: str, summary: str):
    match = UNIT_RE.search(" ".join(detail.split()))
    kind = (re.match(r"([A-Za-z]+)\s+\d+", summary.strip()) or [None,"Não identificado"])[1].upper()
    if not match: return {"summary":summary.strip(),"type":kind,"city":None,"state":None}
    city = CITY_RE.search(match.group(2))
    return {"summary":summary.strip(),"type":kind,"city":city.group(1).strip() if city else None,"state":city.group(2) if city else match.group(5)}

def read_catalog(path: Path):
    workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = workbook.active
    catalog, warnings = {}, []
    for line, row in enumerate(ws.iter_rows(min_row=2, values_only=True), 2):
        try: key=(int(row[0]),int(row[2]))
        except (TypeError,ValueError): warnings.append(f"Catálogo linha {line}: continuação truncada ignorada"); continue
        options=[]
        if row[5] not in (None,"","NULL"):
            try: options=[item.get("opcao",{}) for item in json.loads(row[5]).get("Opcoes",[])]
            except Exception: warnings.append(f"Catálogo linha {line}: opções truncadas")
        catalog[key]={"formName":str(row[1]),"question":str(row[3]),"type":str(row[4]),"options":options}
    workbook.close()
    return catalog, warnings

def import_data(csv_path: Path, catalog_path: Path, output: Path):
    catalog, warnings = read_catalog(catalog_path)
    with csv_path.open(encoding="utf-8-sig", newline="") as source: rows=[r for r in csv.reader(source) if any(c.strip() for c in r)]
    if not rows or any(len(r)!=17 for r in rows): raise ValueError("CSV deve possuir exatamente 17 colunas em todas as linhas")
    dims={k:[] for k in ("forms","councils","units","responsibles","sexes","ageBands","ageQualities","questions","questionGroups","options")}; indexes={k:{} for k in dims}
    def idx(kind, key, value):
        if key not in indexes[kind]: indexes[kind][key]=len(dims[kind]); dims[kind].append(value)
        return indexes[kind][key]
    facts=[]; total=0; invalid_age=0; group_labels={}
    for line,r in enumerate(rows,1):
        year,month,form_id,qid,qty=int(r[0]),int(r[1]),int(r[2]),int(r[11]),int(r[16]); total+=qty
        if not 1<=month<=12 or qty<=0: raise ValueError(f"Linha {line}: mês ou quantidade inválida")
        entry=catalog.get((form_id,qid));
        if not entry: raise ValueError(f"Linha {line}: questão {qid} do formulário {form_id} ausente no catálogo")
        unit=parse_unit(r[6],r[5]); band,quality=age(year,r[10]); invalid_age += qty if quality=="Inválida" else 0
        group_key=norm(entry["question"]); group_label=group_labels.setdefault(group_key,entry["question"].strip())
        form=idx("forms",form_id,{"id":form_id,"name":r[3].strip()}); council=idx("councils",r[4].strip(),r[4].strip()); unit_i=idx("units",unit["summary"],unit)
        responsible=idx("responsibles",r[8].strip(),r[8].strip()); sex=idx("sexes",r[9].strip(),r[9].strip()); age_i=idx("ageBands",band,band); quality_i=idx("ageQualities",quality,quality)
        question=idx("questions",qid,{"id":qid,"formId":form_id,"label":entry["question"].strip(),"type":entry["type"].strip()}); group=idx("questionGroups",group_key,{"id":group_key,"label":group_label})
        option_label = r[14].strip() if r[14].strip().upper()!="NULL" else ("Sim" if r[15].strip()=="1" else "Não" if r[15].strip()=="0" else "Não informado")
        option=idx("options",(group_key,norm(option_label)),{"groupId":group_key,"label":option_label})
        facts.append([year,month,form,council,unit_i,responsible,sex,age_i,quality_i,question,group,option,qty])
    source_hash=hashlib.sha256(csv_path.read_bytes()+catalog_path.read_bytes()).hexdigest()
    manifest={"schemaVersion":"1.0.0","module":"respostas-formularios","datasetVersion":source_hash[:16],"generatedAt":datetime.now(timezone.utc).isoformat().replace("+00:00","Z"),"periodStart":min(f"{r[0]}-{int(r[1]):02d}" for r in rows),"periodEnd":max(f"{r[0]}-{int(r[1]):02d}" for r in rows),"publishedRows":len(facts),"totalSelections":total,"invalidAgeQuantity":invalid_age,"warnings":len(warnings),"sourceSha256":source_hash}
    payload={"manifest":manifest,"dimensions":dims,"facts":facts,"quality":{"warnings":warnings}}
    output.parent.mkdir(parents=True,exist_ok=True); temp=Path(tempfile.mkdtemp(dir=output.parent)); target=temp/output.name; target.mkdir()
    for name,data in payload.items(): (target/f"{name}.json").write_text(json.dumps(data,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    backup=output.with_name(output.name+"-backup");
    if backup.exists(): shutil.rmtree(backup)
    if output.exists(): output.replace(backup)
    target.replace(output); shutil.rmtree(temp); shutil.rmtree(backup,ignore_errors=True)
    return manifest

if __name__ == "__main__":
    parser=argparse.ArgumentParser(); parser.add_argument("--input",type=Path,required=True); parser.add_argument("--catalog",type=Path,required=True); parser.add_argument("--output",type=Path,default=Path("public/data/respostas-formularios")); args=parser.parse_args()
    print(json.dumps(import_data(args.input,args.catalog,args.output),ensure_ascii=False,indent=2))
