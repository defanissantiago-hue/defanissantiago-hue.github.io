// QA: linker estático para ES modules de Scorpion Workouts.
// Detecta imports inexistentes (por ejemplo resolveMedia), sintaxis inválida
// y rutas rotas sin acceder a Supabase ni ejecutar la aplicación.
import { strict as assert } from 'node:assert'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { SourceTextModule, createContext } from 'node:vm'
const root=resolve(new URL('../js/', import.meta.url).pathname)
const files=readdirSync(root).filter(f=>f.endsWith('.js')).map(f=>join(root,f))
const cache=new Map()
const ctx=createContext({})
function load(path){
  path=resolve(path)
  assert(existsSync(path), 'No existe import relativo: '+path)
  if(cache.has(path))return cache.get(path)
  const source=readFileSync(path,'utf8')
  const mod=new SourceTextModule(source,{identifier:path,context:ctx})
  cache.set(path,mod)
  return mod
}
for(const f of files)load(f)
let failed=false
for(const [file,module] of cache){
  if(module.status!=='unlinked')continue
  try{
    await module.link((specifier,from)=>{
      if(!specifier.startsWith('.'))throw Error('Import estático externo sin política de proveedor: '+specifier+' desde '+from.identifier)
      return load(resolve(dirname(from.identifier),specifier))
    })
  }catch(err){
    failed=true
    console.error('ERROR ESM en '+file+': '+String(err))
  }
}
if(failed)process.exitCode=1
else console.log('Scorpion ESM OK: '+cache.size+' módulos locales verificados, sin ejecuciones ni credenciales.')
