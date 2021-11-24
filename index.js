const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const secretKey = 'claveSecreta';
const { nuevoSkater, getSkaters, getSkater, updateSkaterEstado, updateSkater, deleteSkater } = require('./consultas');
const { Pool } = require('pg');

app.listen(3000, () => console.log('Server on port 3000'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/public`));
app.use(expressFileUpload({
    limits: 5000000,
    //limitHandler: 5000000,
    abortOnLimit: true,
    responseOnLimit: 'El tamaño de la imagen supera el limite permitido'
}));
app.use('/css', express.static(`${__dirname}/node_modules/bootstrap/dist/css`));
app.engine(
    'handlebars',
    engine({
        defaultLayout: 'main',
        layoutsDir: `${__dirname}/views/mainLayout`
    })
);
app.set('view engine', 'handlebars');

//rutas raiz
app.get('/', async (req, res) => {

    try {
        const skaters = await getSkaters();
        res.render('Index', { skaters });

    } catch (error) {

        res.status(500).send({
            error: `Algo salio mal... ${error}`,
            code: 500
        });

    }


});

app.get('/registro', (req, res) => {

    res.render('Registro');
});
//agrego skater
app.post('/skaters', async (req, res) => {

    const { files } = req;
    const { foto } = files;
    const { name } = foto;

    const {
        email,
        nombre,
        pass1,
        aniosExp,
        especialidad } = req.body;

    foto.mv(`${__dirname}/public/uploads/${name}`, async (err) => {

        if (err) return res.status(500).send({
            error: `Ops ha ocurrido un error: ${err}`,
            code: 500
        });

        try {

            const skater = await nuevoSkater(email, nombre, pass1, aniosExp, especialidad, name);
            res.status(201).render('Login');

        } catch (error) {
            res.send({
                error: `Ops ha ocurrido un error: ${error}`,
                code: 500
            });
        }

    });
});

//actualizo estado del skater
app.put('/skaters', async (req, res) => {

    const { id, estado } = req.body;

    try {
        const skater = await updateSkaterEstado(id, estado);
        res.status(200).send(skater);

    } catch (error) {
        res.status(500).send({
            error: `Ops ha ocurrido un error... ${error}`,
            code: 500
        });
    }


})

//ruta login
app.get('/Login', (req, res) => {

    res.render('Login');
});

//ruta verify 
app.post('/verify', async (req, res) => {

    const { email, pass } = req.body;
    const skater = await getSkater(email, pass);

    if (skater) {

        if (skater.estado) {

            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + 180,
                    data: skater,
                },
                secretKey
            );
            res.send(token);

        } else {
            res.status(401).send({
                error: 'Este usuario aún no ha sido validado para acceder al sistema skatepark 🛹',
                code: 401
            })
        }

    } else {
        res.status(404).send({
            error: 'Este usuario no esta registrado en el sistema skatepark 🛹',
            code: 404,
        });
    }
});

//ruta admin
app.get('/admin', async (req, res) => {

    try {
        const skaters = await getSkaters();
        res.render('Admin', { skaters });

    } catch (error) {
        res.status(500).send({
            error: `Algo salio mal... ${error}`,
            code: 500
        });
    }
});

//ruta datos destructura el token
app.get('/Datos', async (req, res) => {

    const { token } = req.query;

    jwt.verify(token, secretKey, (err, decoded) => {
        const { data } = decoded;
        const { id, email, nombre, password, anios_experiencia, especialidad } = data;

        (err)
            ? res.status(401).send(
                res.send({
                    error: '401 no Unauthorized',
                    message: 'Usted no está autorizado para estar aqui',
                    token_error: err.message
                })
            )
            : res.render('Datos', { id, email, nombre, password, anios_experiencia, especialidad });
    });
});

//ruta para actualizar un skater
app.put('/skater', async (req, res) => {

    const { id, nombre, password, anios_experiencia, especialidad } = req.body;

    try {
        const skater = await updateSkater(id, nombre, password, anios_experiencia, especialidad);
        res.status(200).send(skater);

    } catch (error) {
        res.status(500).send({
            error: `Algo salio mal... ${error}`,
            code: 500
        });
    }
});

//ruta para eliminar un skater
app.delete('/skater/:id', async (req, res) => {

    const { id } = req.params;

    const respuesta = await deleteSkater(id);
    res.status(200);

    (respuesta > 0)
        ? res.send('Skater eliminado!')
        : res.send('No existe skater!');

});