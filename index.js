// Archivo principal para levantar el servidor y correr, tambien hacer peticiones
//Crear un servidor que reciba peticiones, trabajando con node, node es para backend que se procesa en el servidor, jaavscript se procesa en el cliente o navegados

import express from 'express'
import bodyParser from 'body-parser'  // Alias y nombre de paquete

//Importacion y configuracion de inicializacion de servidor
import { initializeApp , cert} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from './config/firebaseServiceAccount.json' with {type: 'json'} //Aun falta configurar**
//Forma antigua de importa:
// import pkg from 'firebase-admin'
// const { messaging } = pkg


//asserts 
//Archivo de conexiones para credeneciales en una config

//Servidor
//Se monta el servidor
const app = express() // la constante app tiene todas las propiedades de express
const PORT = process.env.PORT || 3010  //Puerto de la nube por defecto si lo encuentra sino usa el 3010 es un OR 

//Configuracion de FireBase con credenciales
initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()
const userCollection = db.collection('users') //Crear base de datos si no existe sino buscarla

app.use(bodyParser.json())

//Operaciones CRUD
//Esquema peticiones html cliente servidor, postman es un cliente para ver peticiones y ver como va funcionando todo
//Verbo, URL, Parametros: son como variables, usar jwt con token, headers son valores de encabezado, body es lo que va dentro de la peticion y van las solicitudes viene en el request
// Dar de alta un usuario, endpoint, api, punto de acceso, aqui se usaran los verbos html para identificar operacion a usar.
//Funciones asincronas, promesas, forzar hasta que se obtenga una respuesta paso al siguiente renglon, la otra forma es con promesas
//Esta es manera arcaica porque no se esta verificando que se entren bien los datos, si llega todo y se valide
//Insertar nuevo usuario:
app.post('/users', async(req, res) => {
    try {
        const newUser = req.body
        const userRef = await userCollection.add(newUser) //se agregue usuario a base de datos
        res.status(201).json({
            id: userRef.id, //id se genera solo
            ...newUser
        }) //Correcto, estatus de exito, da un json de respuesta
    }catch (error) { //Se usa try catch para enviar un error sin tumbar el servidor
        res.status(400).json({
            error: 'Failed to create user'
        })
    }
})
//debe usarse post como verbo, body que es lo que se envia, json como formato y usar sintaxis de objeto

//Leer todos los usuarios
app.get('/users', async(req, res) => {
    try{
        const collUsers = await userCollection.get() //leer usuarios
        //mapeo, itera un arregla y devuelve otro con informacion
        const users = collUsers.docs.map((doc) => ({ //funcion
            id: doc.id,
            ...doc.data()
        }))
        res.status(200).json(users)

    } catch(error) {
        res.status(400).json({
            error: 'Failed to read users'
        })
    }
})

//Leer usuario por id
app.get('/users/:id', async(req, res) => {
    try {
        const userId = req.params.id //identifica automaticamente el parametro como id
        const userDoc = await userCollection.doc(userId).get() //va a la collecion busca el id y trata de obtener la informacion
        if(!userDoc.exists){
            res.status(404).json({
                error: 'User not found'
            })
        } else {
            res.status(200).json({
                id: userDoc.id,
                ...userDoc.data()
            })
        }
    } catch(error) {
        res.status(400).json({
            error: 'Cannot read id'
        })
    }
})

//Eliminar un usuario por ID
app.delete('/users/:id', async(req, res) => {
    try {
        const userId = req.params.id
        await userCollection.doc(userId).delete()
        res.status(200).json({
            message: 'User deleted'
        })

    } catch(error){
        res.status(400).json({
            error: 'Cannot delete user'
        })
    }
})

//Modificar usuario por ID
app.put('/users/:id', async(req, res) => {
    try {
        const userId = req.params.id
        const updateUser = req.body
        await userCollection.doc(userId).set(updateUser, {
            merge: true
        })
        res.status(200).json ({
            id: userId,
            ...updateUser
        })
    } catch(error) {
        res.status(400).json({
            error: 'Cannot update user'
        })
    }
})


//Inicializar el servidor, encenderlo, levantarlo y ponerlo en modo escucha para poder recibir cualquier peticion, es funcion de callback
app.listen(PORT, () => {
    console.log(`Servidor Trabajando en: ${PORT}`) //Cambia segun sea backend o Front, se usa una template string es para usar cadenas dentro de una variable para ver la variable
})

//CRUD funcional, siguiente practica sera para crear encriptacion y crud mas avanzado

