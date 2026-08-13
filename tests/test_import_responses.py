import csv, json, tempfile, unittest
from pathlib import Path
import openpyxl
from scripts.import_responses import import_data

class ImportResponsesTests(unittest.TestCase):
    def test_groups_equal_questions_and_uses_self_when_unique(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); catalog=root/"catalog.xlsx"; source=root/"responses.csv"; output=root/"out"
            wb=openpyxl.Workbook(); ws=wb.active; ws.append(["formulario_id","formulario","questao_id","questao","tipo_questao","opcoes"])
            ws.append([1,"F1",10,"Sexo do cliente?","Lista simples",json.dumps({"Opcoes":[{"opcao":{"id":1,"descricao":"A"}}]})]); ws.append([2,"F2",20,"Sexo do cliente:","Lista simples",json.dumps({"Opcoes":[{"opcao":{"id":2,"descricao":"A"}}]})]); ws.append([2,"F2",21,"Questão única","Sim/Não","NULL"]); wb.save(catalog)
            base=["2026","6","1","F1 [1]","CR","B 1 [CR-SP]","[IdUnidade=1], [Unidade=B 1 - CIDADE/SP], [Situação=Ativo], [Conselho=CR], [UF=SP]","1","RESP","Feminino","1980"]
            rows=[base+["10","Sexo do cliente?","Lista simples","A","NULL","2"], [*base[:2],"2","F2 [2]",*base[4:11],"20","Sexo do cliente:","Lista simples","A","NULL","3"], [*base[:2],"2","F2 [2]",*base[4:11],"21","Questão única","Sim/Não","NULL","1","4"]]
            with source.open("w",encoding="utf-8-sig",newline="") as f: csv.writer(f).writerows(rows)
            result=import_data(source,catalog,output); dimensions=json.loads((output/"dimensions.json").read_text(encoding="utf-8"))
            self.assertEqual(result["totalSelections"],9); self.assertEqual(len(dimensions["questionGroups"]),2)
            self.assertIn("Questão única",[x["label"] for x in dimensions["questionGroups"]])
            self.assertEqual(result["factFiles"],["facts-2026-06.json"])
            self.assertTrue((output/"facts-2026-06.json").is_file())

if __name__=="__main__": unittest.main()
