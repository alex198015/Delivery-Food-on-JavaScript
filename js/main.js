'use strict'

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth')
const modalAuth = document.querySelector('.modal-auth')
const closeAuth = document.querySelector('.close-auth')
const logInForm = document.querySelector('#logInForm')
const loginInput = document.querySelector('#login')
const buttonOut = document.querySelector('.button-out')
const userName = document.querySelector('.user-name')
const cardsRestaurants = document.querySelector('.cards-restaurants')
const containerPromo = document.querySelector('.container-promo')
const restaurants = document.querySelector('.restaurants')
const menu = document.querySelector('.menu')
const logo = document.querySelector('.logo')
const cardsMenu = document.querySelector('.cards-menu')
const restauranTitle = document.querySelector('.restaurant-title')
const rating = document.querySelector('.rating')
const price = document.querySelector('.price')
const category = document.querySelector('.category')
const inputSearch = document.querySelector('.input-search')
const modalBody = document.querySelector('.modal-body')
const modalPricetag = document.querySelector('.modal-pricetag')
const buttonClearCart = document.querySelector('.clear-cart')

let login = localStorage.getItem('login')
let minPriceArr = []
let minPrice

const cart = []


const loadCart = function(){
  if(localStorage.getItem(login)){
    JSON.parse(localStorage.getItem(login)).forEach(item => {
      cart.push(item)
    })
  }
  
}


const saveCart = function(){
  localStorage.setItem(login, JSON.stringify(cart))
}


const valid = function (str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/
  return nameReg.test(str)
}

const getData = async function (url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Ошибка по адрессу ${url}, статус ошибки ${response.status}`)
  }
  return await response.json()

}




function toggleModal() {
  modal.classList.toggle("is-open")
}



function toogleModalAuth() {
  modalAuth.classList.toggle("is-open")
  logInForm.setAttribute('autocomplete', 'off')
  logInForm.reset()
  loginInput.style.borderColor = ''

}

function authorized() {
  
  const logOut = () => {
    localStorage.removeItem('login')
    login = null
    cart.length = 0
    buttonAuth.style.display = ''
    cartButton.style.display = ''
    userName.style.display = ''
    buttonOut.style.display = ''
    buttonOut.removeEventListener("click", logOut)
    checkAuth()
    returnMain()
  }

  console.log('Авторизован');
  buttonAuth.style.display = 'none'
  buttonOut.style.display = 'flex'
  userName.style.display = 'inline'
  cartButton.style.display = 'flex'
  userName.textContent = login
  loadCart()
  buttonOut.addEventListener("click", logOut)
}


function notAuthorized() {
  console.log('Не авторизован');

  function logIn(e) {
    event.preventDefault()


    login = loginInput.value


    if (valid(login)) {
      
      localStorage.setItem('login', login)
      toogleModalAuth()
      buttonAuth.removeEventListener("click", toogleModalAuth)
      closeAuth.removeEventListener("click", toogleModalAuth)
      logInForm.removeEventListener('submit', logIn)
      logInForm.reset()
      checkAuth()
    } else {
      loginInput.style.borderColor = 'red'
      loginInput.value = ''
      alert('Логин не может быть пустым!')
    }

  }


  buttonAuth.addEventListener("click", toogleModalAuth)
  closeAuth.addEventListener("click", toogleModalAuth)
  logInForm.addEventListener('submit', logIn)


}

const checkAuth = () => login ? authorized() : notAuthorized()


function createCardReastaurant({ image, name, time_of_delivery: timeOfDelivery, stars, price, kitchen, products }) {

  const card = `<a class="card card-restaurant" data-products="${products}"
                          data-info="${[name, stars, kitchen]}">
                  <img src="${image}" alt="image" class="card-image"/>
                  <div class="card-text">
                    <div class="card-heading">
                      <h3 class="card-title">${name}</h3>
                      <span class="card-tag tag">${timeOfDelivery}</span>
                    </div>
                    <div class="card-info">
                      <div class="rating">
                        ${stars}
                      </div>
                      <div class="price">От ${price} ₽</div>
                      <div class="category">${kitchen}</div>
                    </div>
                  </div>
                </a>`

  cardsRestaurants.insertAdjacentHTML('beforeend', card)

}



function createCardGood({ name, description, price, image, id }) {



  const card = document.createElement('div')

  card.className = 'card'
  // card.id = id

  card.insertAdjacentHTML('beforeend', `
            <img src="${image}" alt="${name}" class="card-image"/>
            <div class="card-text">
              <div class="card-heading">
                <h3 class="card-title card-title-reg">${name}</h3>
              </div>
              <div class="card-info">
                <div class="ingredients">${description}.
                </div>
              </div>
              <div class="card-buttons">
                <button class="button button-primary button-add-cart" id="${id}">
                  <span class="button-card-text">В корзину</span>
                  <span class="button-cart-svg"></span>
                </button>
                <strong class="card-price-bold card-price">${price} ₽</strong>
              </div>
            </div>
     `
  )
  cardsMenu.insertAdjacentElement('beforeend', card)
}


function openGoods(event) {

  const target = event.target
  if (login) {
    const restaurant = target.closest('.card-restaurant')


    if (restaurant) {
      minPriceArr = []
      const info = restaurant.dataset.info.split(',')

      const [name, stars, kitchen] = info

      cardsMenu.textContent = ''
      containerPromo.classList.add('hide')
      restaurants.classList.add('hide')
      menu.classList.remove('hide')

      restauranTitle.textContent = name
      rating.textContent = stars
      category.textContent = kitchen

      getData(`./db/${restaurant.dataset.products}`)
        .then(data => {


          data.forEach(item => {
            createCardGood(item)
            minPriceArr.push(item.price)

          })
          minPrice = Math.min(...minPriceArr)
          price.textContent = `От ${minPrice} ₽`
        })
    }

  } else {
    toogleModalAuth()
  }

}

function returnMain() {
  containerPromo.classList.remove('hide')
  restaurants.classList.remove('hide')
  menu.classList.add('hide')
}

function addToCart(event) {
  const target = event.target
  const buttonAddToCart = target.closest('.button-add-cart')
  if (buttonAddToCart) {
    const card = target.closest('.card')

    const title = card.querySelector('h3.card-title').textContent
    const cost = card.querySelector('.card-price').textContent
    const id = buttonAddToCart.id
    const food = cart.find(item => {
      return item.id === id
    })

    if (food) {
      food.count++

    } else {
      cart.push({ title, cost, id, count: 1 })
    }

  }
  saveCart()
}

function renderCart() {
  modalBody.textContent = ''
  cart.forEach(item => {
    const itemCart = `
        <div class="food-row">
              <span class="food-name">${item.title}</span>
              <strong class="food-price">${item.cost}</strong>
              <div class="food-counter">
                <button class="counter-button counter-minus" data-id=${item.id}>-</button>
                <span class="counter">${item.count}</span>
                <button class="counter-button counter-plus" data-id=${item.id}>+</button>
              </div>
            </div>
    `
    modalBody.insertAdjacentHTML('afterbegin', itemCart)
  })
  const totalPrice = cart.reduce((total, item) => total + parseFloat(item.cost) * item.count, 0)
  modalPricetag.textContent = totalPrice + ' ' + '₽'

}

function changeCount(event){
  const target = event.target

  if(target.classList.contains('counter-button')){
    const food = cart.find(item => item.id === target.dataset.id) 
    if(target.classList.contains('counter-minus')){
      if(food.count === 0){
        cart.splice(cart.indexOf(food),1)
      } food.count--
    
    }
    if(target.classList.contains('counter-plus'))food.count++
    renderCart()
    saveCart()
    
  }

  // if(target.classList.contains('counter-minus')){
  //     const food = cart.find(item => item.id === target.dataset.id) 
  //     food.count--
  //     renderCart()
  // }

  // if(target.classList.contains('counter-plus')){
  //   const food = cart.find(item => item.id === target.dataset.id) 
  //     food.count++
  //     renderCart()
  // }


}

function init() {

  getData('./db/partners.json')
    .then(data => {

      data.forEach(createCardReastaurant)
    })

  cartButton.addEventListener("click", () => {
    renderCart()
    toggleModal()
    
  });

  close.addEventListener("click", toggleModal);

  buttonClearCart.addEventListener('click',() => {
    cart.length = 0
    renderCart()
    saveCart()
  })

  cardsMenu.addEventListener('click', addToCart)

  cardsRestaurants.addEventListener('click', openGoods)

  modalBody.addEventListener('click', changeCount)

  logo.addEventListener('click', returnMain)

  inputSearch.addEventListener('keydown', function (event) {
    if (event.keyCode === 13) {
      const target = event.target
      const value = target.value.toLowerCase().trim()
      const goods = []

      if (!value) {
        target.style.backgroundColor = 'tomato'
        setTimeout(() => {
          target.style.backgroundColor = ''
        }, 2000)
        return
      }


      getData('./db/partners.json')
        .then(data => {
          const products = data.map(item => item.products)

          products.forEach(item => {
            getData(`./db/${item}`)
              .then(goodset => {
                goods.push(...goodset)
                const searchGoods = goods.filter(item => item.name.toLowerCase().includes(value))


                cardsMenu.textContent = ''

                containerPromo.classList.add('hide')
                restaurants.classList.add('hide')
                menu.classList.remove('hide')

                restauranTitle.textContent = 'Результаты поиска'
                rating.textContent = ''
                category.textContent = ''
                price.textContent = ''

                return searchGoods

              })
              .then(function (data) {
                data.forEach(createCardGood)
              })

          })


        })

    }

  })

  checkAuth()

  new Swiper('.swiper-container', {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 5,
    grabCursor: true,
    autoplay: {
      delay: 3000
    },
    speed: 1000,
  })
  
}

init()
