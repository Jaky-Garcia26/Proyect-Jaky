//*****constantes requeridad 'paquetes'*/
const express = require('express');
const sqlite3 = require('sqlite3');

//***** Instancias*/

const app = express();

//***** configuraciones */
app.set('view engine', 'ejs');

//***** Middleware */
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

//***** DB CONECTION*/
//objeto con 3 parametros, nombreDB, tipo de apertura, error de return
const db = new sqlite3.Database('datos.db', sqlite3.OPEN_READWRITE, (error) => {
    if (error) {
        console.log('Error al conectarse a la base de datos');
    } else {
        console.log('Se conecto a la base de datos con exito');
    }
});

//***** Rutas */
app.get('/', (req, res) => {
    let sql = "select productos.id, nombre, marcas.marca, precio, stock " +
        " from productos, marcas where productos.marca = marcas.id";
    db.all(sql, (error, resultado) => {
        if (error) {
            console.log('Error en la consulta a la base de datos');
        } else {
            sql = "select * from marcas";
            db.all(sql, (error, marcas) => {
                if (error)
                    console.log('Error al obtener las marcas');
                else
                    res.render('principal.ejs', { resultado, marcas });

            });
        }
    })
});

app.post('/nuevo', (req, res) => {
    const { nombre, marca, precio, stock } = req.body;
    const sql = 'insert into productos (nombre,marca,precio,stock) values (?,?,?,?)';
    db.run(sql, [nombre, marca, precio, stock], (error) => {
        if (error)
            console.log('Error al insertar nuevo producto');
        else
            res.redirect('/');
    });
});

app.get('/eliminar', (req, res) => {
    const id = req.query.id;
    const sql = 'delete from productos where id =?';
    db.run(sql, [id], (error) => {
        if (error)
            console.log('Error al eliminar el producto');
        else
            res.redirect('/');
    });
});

app.get('/editar', (req, res) => {
    const id = req.query.id;
    let sql = 'select* from productos where id =?';
    db.all(sql, [id], (error, fila) => {
        if (error)
            console.log('Error al coonsultar el producto');
        else{
            sql = 'select * from marcas'
            db.all(sql, (error, marcas)=>{
                if(error){
                    console.log('Error al consultar marcas')
                } else{
                    res.render('editar.ejs', { fila, marcas});
                }
            })

        }
    });
});

app.post('/editar', (req, res) => {
    const { id, nombre, marca, precio, stock } = req.body;
    const sql = "update productos set nombre=?, marca=?, precio=?, stock=? where id=?";
    db.run(sql, [nombre, marca, precio, stock, id], (error) => {
        if (error)
            console.log('Error al eliminar el producto');
        else
            res.redirect('/');
    });
});

app.post('/buscar', (req, res) => {
    const nombre = req.body.buscar;
    let sql = "select productos.id, nombre, marcas.marca, precio, stock " +
        " from productos, marcas where productos.marca = marcas.id " +
        " and nombre like ?";
    db.all(sql, [nombre + '%'], (error, resultado) => {
        if (error) {
            console.log('rror en la consulta a la base de datos');
        }
        else {
            sql = "select * from marcas";
            db.all(sql, (error, marcas) => {
                if (error)
                    console.log('Error al obtener las marcas');
                else
                    res.render('principal.ejs', { resultado, marcas });

            });
        }
    });
});


app.get('/marcas', (req, res) => {
    const sql = 'select * from marcas order by marca';
    db.all(sql, (error, filas) => {
        if (error)
            console.log('Error al consultar la BD');
        else
            res.render('marcas.ejs', { filas })
    });
});

app.post('/nueva_marca', (req, res) => {
    const marca = req.body.marca;
    const sql = 'insert into marcas (marca) values (?)';
    db.run(sql, [marca], (error) => {
        if (error)
            console.log('Error al insertar nueva marca');
        else
            res.redirect('/marcas');
    });
});

app.get('/editar_marca', (req, res) => {
    const id = req.query.id;
    const sql = 'select * from marcas where id=?';
    db.all(sql, [id], (error, fila) => {
        if (error)
            console.log('Error al consultar la marca');
        else
            res.render('editar_marcas.ejs', { fila })
    });
});

app.post('/editar_marca', (req, res) => {
    const { id, marca } = req.body;
    const sql = 'update marcas set marca=? where id=?';
    db.run(sql, [marca, id], (error) => {
        if (error)
            console.log('Error al actualizar la marca');
        else
            res.redirect('/marcas');
    });
});

app.get('/eliminar_marca', (req, res) => {
    const id = req.query.id;
    const sql = 'delete from marcas where id =?';
    db.run(sql, [id], (error) => {
        if (error)
            console.log('DELETE SUCCESFULL');
        else
            res.redirect('/marcas');
    });
});



//***** Configuración del puerto dinámico */
const PORT = process.env.PORT || 3000;

//***** Ejecución del servidor */
app.listen(PORT, () => {
    console.log(`PonshitoReady en el puerto ${PORT}`);
});