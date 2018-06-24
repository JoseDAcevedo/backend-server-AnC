var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

//Importar modelos
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) =>{

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Tipos de colección
    var colVal = ['hospitales', 'medicos', 'usuarios'];
    if(colVal.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errors: { message: 'La colección debe ser '+ colVal.join(', ')}
        });
    }

    //Verifica si se ha cargado un archivo
    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen'}
        });
    }

    //Obtener nombre del archivo y la extensión
    var archivo = req.files.imagen;
    var nomCort = archivo.name.split('.');
    var extArchivo = nomCort[ nomCort.length -1 ];

    //Extensiones permitidas del archivo
    var extVal = ['png', 'jpg', 'gif', 'jpeg'];
    if(extVal.indexOf(extArchivo) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones permitidas son ' + extVal.join(', ')}
        });
    }

    //Nombre personalizado
    var nomPer = `${ id }-${ new Date().getMilliseconds() }.${ extArchivo }`;

    //Mover el archivo
    var path = `./uploads/${ tipo }/${ nomPer }`;
    archivo.mv(path, err => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        
        subirPorTipo(tipo, id, nomPer, res);

    })

});

function subirPorTipo( tipo, id, nomPer, res ){

    if( tipo == 'hospitales'){

        Hospital.findById(id, (err, hospital) =>{

            if(!hospital){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Hospital no existe',
                    errors: ['Hospital no existe ', err]
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            hospital.img = nomPer;

            hospital.save((err, hospitalActual) => {

                return res.status(200).json({
                    ok:true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActual
                });

            })

        });

    }

    if( tipo == 'medicos'){
        
        Medico.findById(id, (err, medico) =>{

            if(!medico){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'El medico no existe',
                    errors: ['Medico no existe ', err]
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            medico.img = nomPer;

            medico.save((err, medicoActual) => {

                return res.status(200).json({
                    ok:true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActual
                });

            })

        });

    }
    
    if( tipo == 'usuarios'){
        
        Usuario.findById(id, (err, usuario) =>{

            if(!usuario){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Usuario no existe',
                    errors: ['Usuario no existe ', err]
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Si existe, elimina la imagen anterior
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            usuario.img = nomPer;

            usuario.save((err, usuarioActual) => {

                usuarioActual.password = '.-.';

                return res.status(200).json({
                    ok:true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActual
                });

            })

        });

    }

}

module.exports = app;