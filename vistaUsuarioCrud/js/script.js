const cards = document.getElementById("cards")
const items = document.getElementById("items")
const footer = document.getElementById("footer")

const btnComprar = document.getElementById('btnComprar')
const overlay = document.getElementById('overlay')
const popup = document.getElementById('popup')
const btnCerrarPopup = document.getElementById('btn-cerrar-popup')
const btnSubmit = document.getElementById('btn-submit')


const templateCard = document.getElementById("template-card").content
//el Content del templateCard es importante para poder acceder a los elementos del template
const templateFooter = document.getElementById("template-footer").content
const templateCarrito = document.getElementById("template-carrito").content
const fragment = document.createDocumentFragment()

//fragment - memoria volatil
let carrito = {} //definicion del objeto carrito vacio



document.addEventListener("DOMContentLoaded", () => {
    fetchData()
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        drawCarrito()
    }
})
cards.addEventListener('click', event => {
    addCarrito(event)
})

items.addEventListener('click', event => {
    btnAccion(event)
})

btnComprar.addEventListener('click', () => {
    overlay.classList.add('active')
    popup.classList.add('active')
});

btnCerrarPopup.addEventListener('click', ()=> {
    overlay.classList.remove('active')
    popup.classList.remove('active')
    carrito = {}
    drawCarrito()
})

btnSubmit.addEventListener('click', ()=> {
    overlay.classList.remove('active')
    popup.classList.remove('active')
    carrito = {}
    drawCarrito()
})


const url = "https://agusange01.pythonanywhere.com/productos"
const fetchData = async () => {
    try {
        const res = await fetch(url)
        const data = await res.json()
        // console.log(data)
        drawCard(data)
    } catch (error) {
        console.log(error)
    }
}

//DIBUJO DE LAS TARJETAS
const drawCard = data => {
    //console.log(data)
    data.forEach(element => {
        //console.log(element) //se usa el forEach dado que se recorre un Json
        templateCard.querySelector('h5').textContent = element.nombre
        templateCard.querySelector('strong').textContent = element.precio
        templateCard.querySelector('img').setAttribute('src', element.imagen)
        templateCard.querySelector('.btn-dark').dataset.id = element.id //id automatico segun json

        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    });
    cards.appendChild(fragment)
}

//DETECCION DE BOTON COMPRAR
const addCarrito = event => {
    //console.log(event.target)
    //console.log(event.target.classList.contains('btn-dark'))
    if (event.target.classList.contains('btn-dark')) {
        //console.log(event.target.parentElement)//selecciona todo el objeto por el id almacenado en event
        setCarrito(event.target.parentElement)
    }
    event.stopPropagation() //detiene otros eventos que puedan generarse del cards
}
//MANIPULACION DEL CARRITO
const setCarrito = objeto => {
    //    NOM_FUNCION = RECIBE => HACE
    //console.log(objeto)
    const producto = {
        id: objeto.querySelector(".btn-dark").dataset.id,
        nombre: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('strong').textContent,
        cantidad: 1,
    }
    //console.log(producto)
    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1
        
    }
    carrito[producto.id] = { ...producto } //hace una copia del producto, en la posicion producto.id del carrito
    //con los ... solo adquiere la info de producto
    //console.log(carrito)
    drawCarrito()
    btnComprar.style.display = 'flex';
    
}

//IMPRESION DEL CARRITO EN EL DOM
const drawCarrito = () => {
    //console.log(carrito)
    items.innerHTML = ''
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.nombre
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id
        templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad
        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)

    drawFooter()

    localStorage.setItem('carrito', JSON.stringify(carrito))
}

//IMPRESION DEL TOTAL DEL CARRITO
const drawFooter = () => {
    footer.innerHTML = '' //fflush(stdin)
    if (Object.keys(carrito).length === 0) { //si el carrito esta vacio...
        footer.innerHTML = `<th scope="row" colspan="5">Carrito vacio</th>`
        btnComprar.classList.remove('active')
        btnComprar.style.display = 'none';
        return
    }
    //sumatoria de cantidad -> cantidad, va entre {} por ser un obj, retorna un numero, por ello, se especifica {acumulador+cantidad,0}
    const nCantidad = Object.values(carrito).reduce((acumulador, { cantidad }) => acumulador + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acumulador, { cantidad, precio }) => cantidad * precio + acumulador, 0)
    //console.log(nCantidad)
    //console.log(nPrecio)

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad

    templateFooter.querySelector('span').textContent = nPrecio

    //hechos los templates, deben ser clonados
    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)

    //funcionalidad boton limpiar carrito de compras
    const btnErase = document.getElementById('vaciar-carrito')
    btnErase.addEventListener('click', () => {
        carrito = {}
        btnComprar.style.display = 'none';
        drawCarrito()
    })
}

const btnAccion = (event) => {
    event.target
    //Funcionalidad boton aumento de unidades en carrito
    if (event.target.classList.contains('btn-info')) {
        //console.log(carrito[event.target.dataset.id])
        const producto = carrito[event.target.dataset.id]
        producto.cantidad = carrito[event.target.dataset.id].cantidad + 1
        carrito[event.target.dataset.id] = { ...producto }
        drawCarrito()
    } else if (event.target.classList.contains('btn-danger')) {
        console.log(carrito[event.target.dataset.id])
        const producto = carrito[event.target.dataset.id]
        producto.cantidad--

        if (producto.cantidad === 0) {
            delete carrito[event.target.dataset.id]
        }
        drawCarrito()
    }
    event.stopPropagation()
}