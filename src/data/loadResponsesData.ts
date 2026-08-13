import type { ResponseData, ResponseDimensions, ResponseManifest } from "../types/responses";
const url=(file:string)=>`${import.meta.env.BASE_URL}data/respostas-formularios/${file}.json`;
async function get<T>(file:string){const response=await fetch(url(file),{cache:"no-cache"});if(!response.ok)throw new Error(`Falha ao carregar ${file}`);return response.json() as Promise<T>}
export async function loadResponsesData():Promise<ResponseData>{const [manifest,dimensions,facts]=await Promise.all([get<ResponseManifest>("manifest"),get<ResponseDimensions>("dimensions"),get<number[][]>("facts")]);if(facts.length!==manifest.publishedRows)throw new Error("Carga de respostas diverge do manifesto");return {manifest,dimensions,facts}}
