
not_found = {
    404: {
        "description": "Response not found si no se encuentra el id",
        "content": {
            "application/json": {
                "example": {
                    "detail": "id del cliente no encontrada",
                }
            }
        },
    },
}


not_found_dni={
    404: {
        "description": "Response not found si no se encuentra el DNI",
        "content": {
            "application/json": {
                "example": {
                    "detail": "DNI del cliente no encontrado",
                }
            }
        },
    },
}


conflict = {
    409: {
        "description": "Conflicto turnos",
        "content": {
            "application/json": {
                "example": {"detail": "Ya hay un turno para ese día y esa hora"}
            }
        }
    }
}