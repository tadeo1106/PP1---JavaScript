let nombre = prompt("Ingrese su nombre:");

if (nombre === "") {
    console.log("Error: no ingresó un nombre.");   
} else {
    let edad = parseInt(prompt("Ingrese su edad:"));

    if (edad < 18) {
        console.log("Acceso denegado: debe tener más de 18 años.");
    }

    let contraseña = prompt("Ingrese una contraseña:");

    if (contraseña.length < 6) {
        console.log("La contraseña debe tener mínimo 6 caracteres.");    
    }

    edad+=10

    
    console.log(`Tu nombre es ${nombre} y tu edad en diez años sería ${edad}.`);
}


