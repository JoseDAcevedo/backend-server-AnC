var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//=========================
// Busqueda por coleccion
//=========================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) =>{

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var rexp = new RegExp( busqueda, 'i');

    var promesa;

    switch(tabla){
        case 'usuario':
            promesa = buscarUsuario(busqueda, rexp);
        break;
        case 'hospital':
            promesa = buscarHospital(busqueda, rexp);
        break;
        case 'medico':
            promesa = buscarMedico(busqueda, rexp);
        break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'El tipo de búsqueda no es válido',
                error: {message: 'Tipo de tabla/colección no válido'}
            })
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })

});

//==================
// Busqueda general
//==================
app.get('/todo/:busqueda', (req, res, next) =>{

    var busqueda = req.params.busqueda;
    var rexp = new RegExp( busqueda, 'i' );

    Promise.all([
            buscarHospital(busqueda, rexp),
            buscarMedico(busqueda, rexp),
            buscarUsuario(busqueda, rexp) ])
        .then( respuestas => {
            
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });

        })
});

function buscarHospital(busqueda, rexp){
    
    return new Promise( (resolve, reject)=> {

        Hospital.find({ nombre: rexp })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales)=>{
            
                if(err){
                    reject('Error al cargar hospitales');
                } else {
                    resolve(hospitales);
                }
            })

    });
    
}

function buscarMedico(busqueda, rexp){
    
    return new Promise( (resolve, reject)=> {

        Medico.find({ nombre: rexp })
            .populate('usuario', 'nombre email img')
            .populate('hospital', 'nombre')
            .exec((err, medicos)=>{
            
                if(err){
                    reject('Error al cargar medicos');
                } else {
                    resolve(medicos);
                }

            })

    });
    
}

function buscarUsuario(busqueda, rexp){
    
    return new Promise( (resolve, reject)=> {

        Usuario.find({}, 'nombre email role img google')
            .or([ {'nombre': rexp}, {'email': rexp}])
            .exec( (err, usuarios) =>{
                if(err){
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            })

    });
    
}

module.exports = app;