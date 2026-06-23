from pydantic import BaseModel, Field
from typing import Annotated



configSchemasID=Annotated[int , Field(gt=0,description="id del cliente")]

configSchemaDocumento=Annotated[str,Field(min_length=7)]

configSchemaCliente=Annotated[str,Field(min_length=3,max_length=20)]

configSchemaDia = Annotated[str,Field(min_length=5, max_length=9)]

configSchemaHorario = Annotated[str,Field(min_length=5 ,description="horario del turno ej: 18:30")]

configSchemasServicio = Annotated[list,Field(min_length=1,description="servicios ej:[corte,barba]")]





class TurnoSchemas(BaseModel):

    id : configSchemasID
    documento:configSchemaDocumento
    cliente:configSchemaCliente
    dia : configSchemaDia
    horario : configSchemaHorario
    servicio : configSchemasServicio


class TurnoCreateUpdateSchemas(BaseModel):
    documento:configSchemaDocumento 
    cliente:configSchemaCliente
    dia : configSchemaDia
    horario : configSchemaHorario
    servicio : configSchemasServicio
