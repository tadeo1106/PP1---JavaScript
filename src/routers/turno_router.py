from typing import Annotated

from models.turno_model import TurnoSchemas,TurnoCreateUpdateSchemas

from fastapi import APIRouter, HTTPException ,Query,Path 

from database.db import turnos 

from core.exceptions import not_found,not_found_dni,conflict

router=APIRouter()


path_id = Annotated[int, Path(gt=0, description="id mayor a 0")]


@router.get("/turnos", response_model=list[TurnoSchemas])
async def mostrar_turnos(
        servicio: str = Query(description="¿Por qué servicio desea filtrar?", default=None),
):
    turnos_filtrados = turnos

    if servicio:
        turnos_filtrados = [
            turno for turno in turnos
            if servicio in turno["servicio"]
        ]
    
    return turnos_filtrados


@router.get("/turnos/id/{id}", response_model=TurnoSchemas,responses= not_found)
async def turno_by_id( id:path_id):
    for turno in turnos:
        if turno["id"]==id:
            return turno
    raise HTTPException(status_code=404,detail="id no encontrado")





@router.get("/turnos/dni/{dni}",response_model=TurnoSchemas,responses=not_found_dni)
async def turno_by_dni(dni:Annotated[str,Path(min_length=7)]):
    for turno in turnos:
        if turno["documento"]==dni:
            return turno
    raise HTTPException(status_code=404,detail="DNI no encontrado")




@router.post("/turnos",response_model=TurnoSchemas,responses=conflict)
async def agregar_turno(turno:TurnoCreateUpdateSchemas):

    for t in turnos:
        if t["dia"].lower() ==  turno.dia.lower() and t["horario"]==turno.horario:
            raise HTTPException(status_code=409,detail="ya hay un turno para ese dia y esa hora ")
        

    id=max(turnos,key=lambda x:x["id"])["id"]+1

    nuevo_turno=(turno.model_dump())

    nuevo_turno["id"]=id

    turnos.append(nuevo_turno)
    
    return nuevo_turno      



@router.put("/turnos/{id}",response_model=TurnoSchemas,responses=not_found)
async def modificar_turno(
    id:path_id,
    turno_editar:TurnoCreateUpdateSchemas
    ):
    for turno in turnos:
        if turno["id"] == id:
            turno["documento"]=turno_editar.documento
            turno["cliente"]=turno_editar.cliente
            turno["dia"]=turno_editar.dia
            turno["horario"]=turno_editar.horario
            turno["servicio"]=turno_editar.servicio
            

            return turno
        
    raise HTTPException(status_code=404, detail="id del turno no encontrado")


@router.delete("/turnos/{id}", responses=not_found)
async def eliminar_turno(id: path_id):
    for turno in turnos:
        if turno["id"] == id:
            turnos.remove(turno) 
            return {"mensaje": "Turno eliminado"}
            
    raise HTTPException(status_code=404, detail="id no encontrado")