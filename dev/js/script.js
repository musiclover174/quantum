(function () {

  window.animation = {}

  window.animation.fadeIn = (elem, ms, cb, d = 'block') => {
    if (!elem)
      return;

    elem.style.opacity = 0;
    elem.style.display = d;

    if (ms) {
      var opacity = 0;
      var timer = setInterval(function () {
        opacity += 50 / ms;
        if (opacity >= 1) {
          clearInterval(timer);
          opacity = 1;
          if (cb) cb()
        }
        elem.style.opacity = opacity;
      }, 50);
    } else {
      elem.style.opacity = 1;
      if (cb) cb()
    }
  }

  window.animation.fadeOut = (elem, ms, cb) => {
    if (!elem)
      return;

    elem.style.opacity = 1;

    if (ms) {
      var opacity = 1;
      var timer = setInterval(function () {
        opacity -= 50 / ms;
        if (opacity <= 0) {
          clearInterval(timer);
          opacity = 0;
          elem.style.display = "none";
          if (cb) cb()
        }
        elem.style.opacity = opacity;
      }, 50);
    } else {
      elem.style.opacity = 0;
      elem.style.display = "none";
      if (cb) cb()
    }
  }

  window.animation.scrollTo = (to, duration) => {
    if (duration <= 0) return;
    const element = document.documentElement,
      difference = to - element.scrollTop,
      perTick = difference / duration * 10;

    setTimeout(function () {
      element.scrollTop = element.scrollTop + perTick;
      window.animation.scrollTo(to, duration - 10);
    }, 10);
  }

  window.animation.visChecker = (el) => {
    let rect = el.getBoundingClientRect()
    return (
      //rect.top >= 0 &&
      //rect.left >= 0 &&
      rect.bottom - el.offsetHeight * .35 <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  window.site = {}

  window.site.form = ({

    init: function () {

      const _th = this,
        inputs = document.querySelectorAll('.common__input, .common__textarea'),
        forms = document.querySelectorAll('form'),
        selectors = document.querySelectorAll('.js-select'),
        choicesArr = [],
        digitsInput = document.querySelectorAll('.js-digits')

      $('.js-phone').mask('+7(999) 999-9999')

      function emptyCheck(event) {
        event.target.value.trim() === '' ?
          event.target.classList.remove('notempty') :
          event.target.classList.add('notempty')
      }
      
      for (let item of inputs) {
        item.addEventListener('keyup', emptyCheck)
        item.addEventListener('blur', emptyCheck)
      }

      if (document.querySelectorAll('.js-common-file').length) {
        let commonFile = document.querySelectorAll('.js-common-fileinput'),
          commonFileDelete = document.querySelectorAll('.js-common-filedelete')

        for (let fileInp of commonFile) {
          fileInp.addEventListener('change', (e) => {
            let el = fileInp.nextElementSibling,
              path = fileInp.value.split('\\'),
              pathName = path[path.length - 1].split('');

            pathName.length >= 30 ?
              pathName = pathName.slice(0, 28).join('') + '...' :
              pathName = pathName.join('')

            el.textContent = pathName;
            el.classList.add('choosed');
          })
        }

        for (let fileDelete of commonFileDelete) {
          fileDelete.addEventListener('click', (e) => {
            let el = fileDelete.previousElementSibling,
              fileInput = fileDelete.previousElementSibling.previousElementSibling;
            el.textContent = el.getAttribute('data-default');
            fileInput.value = '';
            el.classList.remove('choosed');
          })
        }
      }

      for (let form of forms) {
        form.addEventListener('submit', e => !_th.checkForm(form) && e.preventDefault() && e.stopPropagation())
      }

      for (let selector of selectors) {
        let choice = new Choices(selector, {
          searchEnabled: false,
          itemSelectText: '',
          position: 'bottom'
        });
        choicesArr.push(choice);
      }

      for (let digitInput of digitsInput) {
        digitInput.addEventListener('keydown', (e) => {
          let validArr = [46, 8, 9, 27, 13, 110, 190]
          if (validArr.indexOf(e.keyCode) !== -1 ||
            (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            return;
          }
          if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault()
          }
        });
      }

      return this
    },

    checkForm: function (form) {
      let checkResult = true;
      const warningElems = form.querySelectorAll('.warning');

      form.classList.remove('warning')
      
      if (warningElems.length) {
        for (let warningElem of warningElems) {
          warningElem.classList.remove('warning')
        }
      }

      for (let elem of form.querySelectorAll('input, textarea, select')) {
        if (elem.getAttribute('data-req')) {
          switch (elem.getAttribute('data-type')) {
            case 'tel':
              var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
              if (!re.test(elem.value)) {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
            case 'email':
              var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
              if (!re.test(elem.value)) {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
            case 'file':
              if (elem.value.trim() === '') {
                elem.parentNode.classList.add('warning')
                checkResult = false
              }
              break;
            default:
              if (elem.value.trim() === '') {
                elem.classList.add('warning')
                checkResult = false
              }
              break;
          }
        }
      }
      
      for (let item of form.querySelectorAll('input[name^=agreement]')) {
        if (!item.checked) {
          item.classList.add('warning')
          checkResult = false
        }
      }
      
      if (!checkResult) form.classList.add('warning')
        
      return checkResult
    }

  }).init()

  window.site.obj = ({

    resizeWatcher: () => {
      const tableSel = document.querySelectorAll('table'),
        scrollArray = [];
      if (tableSel.length) {
        tableSel.forEach((item, i) => {
          let orgHtml = item.outerHTML,
            def = 'default';

          if (item.getAttribute('class')) def = '';

          item.outerHTML = `<div class='table-scroller${i} ${def}'>${orgHtml}</div>`;
          let ps = new PerfectScrollbar(`.table-scroller${i}`, {
            wheelPropagation: true
          });
          scrollArray.push(ps);
        });
        window.addEventListener('resize', () => {
          if (scrollArray.length)
            scrollArray.forEach((item, i) => {
              item.update()
            });
        });
      }

    },

    asyncScroll: () => {
      const featElems = document.querySelectorAll('.js-async-scroll')
      
      featElems.forEach(item => item.setAttribute('data-top', parseInt(getComputedStyle(item)['top'])))
      
      window.addEventListener('scroll', () => {
        featElems.forEach(item => {
          const rect = item.getBoundingClientRect(),
                diff = rect.bottom - item.offsetHeight - (window.innerHeight || document.documentElement.clientHeight),
                dataKoef = item.getAttribute('data-koef'),
                dataTop = item.getAttribute('data-top')
          
          if (diff <= 0 && (rect.top + item.offsetHeight >= 0)) {
            item.style.top = dataTop - diff * dataKoef + 'px'
          }
        })
      })
    },
    
    banner: () => {
      const bannerSwiper = new Swiper('.js-banner', {
        loop: true,
        speed: 1200,
        spaceBetween: 30,
        parallax: true,
        navigation: {
          nextEl: '.js-banner ~ .swiper-buttons .swiper-button-next',
          prevEl: '.js-banner ~ .swiper-buttons .swiper-button-prev',
        },
        autoplay: {
          delay: 5000
        },
        breakpoints: {
          900: {
            autoHeight: true
          }
        },
        on: {
          slideChangeTransitionStart: function (){
            document.querySelector('.banner__count span').textContent = ('0' + (this.realIndex + 1)).slice(-2)
          }
        }
      })
    },
    
    partners: () => {
      const bannerSwiper = new Swiper('.js-partn', {
        loop: true,
        slidesPerView: 5,
        speed: 700,
        spaceBetween: 30,
        autoplay: {
          delay: 5000
        },
        navigation: {
          nextEl: '.js-partn ~ .swiper-buttons .swiper-button-next',
          prevEl: '.js-partn ~ .swiper-buttons .swiper-button-prev',
        },
        breakpoints: {
          500: {
            slidesPerView: 2,
            spaceBetween: 40
          },
          700: {
            slidesPerView: 3,
            spaceBetween: 40
          },
          1000: {
            slidesPerView: 4,
            spaceBetween: 40
          }
        }
      })
    },
    
    serts: () => {
      const bannerSwiper = new Swiper('.js-serts', {
        loop: true,
        slidesPerView: 4,
        speed: 700,
        spaceBetween: 30,
        navigation: {
          nextEl: '.js-serts ~ .swiper-buttons .swiper-button-next',
          prevEl: '.js-serts ~ .swiper-buttons .swiper-button-prev',
        },
        breakpoints: {
          450: {
            slidesPerView: 1,
            spaceBetween: 40
          },
          767: {
            slidesPerView: 2,
            spaceBetween: 40
          },
          900: {
            slidesPerView: 3,
            spaceBetween: 30
          }
        }
      })
    },
    
    hover3d: () => {
      const koef = 20
      
      for (let elem of document.querySelectorAll('.js-hover3d')) {
        elem.addEventListener('mousemove', (e) => {
          let x = e.clientX - elem.getBoundingClientRect().x,
              y = e.clientY - elem.getBoundingClientRect().y,
              dx = x / elem.offsetWidth - .5,
              dy = y / elem.offsetHeight - .5
          
          elem.setAttribute('style', `transform: rotateY(${dx * koef}deg) rotateX(${dy * koef}deg)`)
        })
        elem.addEventListener('mouseleave', (e) => {
          elem.removeAttribute('style')
        })
      }
    },
    
    contacts: () => {
      const mapEl = document.querySelector('.js-contacts-map'),
            geo = mapEl.getAttribute('data-coords').split(', ')

			const map = new ymaps.Map(mapEl, {
				center: [geo[0], geo[1]],
				zoom: 13,
				controls: [],
				behaviors: ['default', 'scrollZoom']
			})

			const PMitem = new ymaps.Placemark([geo[0], geo[1]], {}, {
				iconLayout: 'default#image',
				iconImageSize: [27, 41],
				iconImageHref: '/static/i/pin.png',
				iconImageOffset: [-3, -42],
				hideIconOnBalloonOpen: false,
				balloonOffset: [-22, -49]
			})
      
			map.geoObjects.add(PMitem)
    },
    
    sticky: () => {
      const sidebar = new StickySidebar('.js-sticky', {
        containerSelector: '.js-sticky-parent',
        innerWrapperSelector: '.js-sticky-inner',
        topSpacing: 20,
        bottomSpacing: 0
      })
    },
    
    filter: () => {
      const elOpener = document.querySelector('.js-filter-opener'),
            elContent = document.querySelector('.js-filter-content')
      
      elOpener.addEventListener('click', () => {
        elOpener.classList.toggle('open')
        elContent.classList.toggle('open')
      })
    },
    
    init: function () {

      const burgerEl = document.querySelector('.js-burger'),
        html = document.querySelector('html'),
        headerEl = document.querySelector('.header'),
        elemsToCheck = ['.news__elem-imgover', '.js-scroll-imgover', '.about__steps-elem']

      burgerEl.addEventListener('click', (e) => {
        html.classList.toggle('burgeropen')
        if (burgerEl.classList.contains('open')) {
          burgerEl.classList.add('remove')
          setTimeout(() => {
            burgerEl.classList.remove('open', 'remove')
          }, 1000)
        } else {
          burgerEl.classList.add('open')
        }
        e.preventDefault()
      })

      if (document.querySelector('.js-async-scroll')) this.asyncScroll()
      if (document.querySelector('.js-banner')) this.banner()
      if (document.querySelector('.js-serts')) this.serts()
      // if (document.querySelectorAll('.js-hover3d').length) this.hover3d()
      if (document.querySelector('.js-contacts-map')) ymaps.ready(this.contacts)
      if (document.querySelector('.js-sticky')) this.sticky()
      if (document.querySelector('.js-filter-opener')) this.filter()
      if (document.querySelector('.js-partn')) this.partners()
         
      objectFitImages('img.fit')
      
      $('[data-fancybox]').fancybox({
        i18n: {
          en: {
            CLOSE: "Закрыть"
          }
        },
        touch: false
      })
      
      window.addEventListener('scroll', () => {
        for (let item of elemsToCheck) {
          for (let elem of document.querySelectorAll(item)) {
            if (window.animation.visChecker(elem)) {
              elem.classList.add('visible')
            }
          }
        }
      })

      this.resizeWatcher()

      document.querySelectorAll('.content *:not([class])').forEach((item) => {
        item.innerHTML = item.innerHTML.replace(/( |&nbsp;|\(){1}([№а-яА-Я]){1}(\.){0,1} /g, '$1$2$3&nbsp;');
        item.innerHTML = item.innerHTML.replace(/( |&nbsp;|\(){1}([№а-яА-Я]){1}(\.){0,1} /g, '$1$2$3&nbsp;');
      });

      for (let sh of document.querySelectorAll('.js-shave')) {
        shave(sh, sh.getAttribute('data-height'))
      }
      
      let eventResize
      try {
        eventResize = new Event('resize')
      }
      catch (e) {
        eventResize = document.createEvent('Event')
        let doesnt_bubble = false,
            isnt_cancelable = false
        eventResize.initEvent('resize', doesnt_bubble, isnt_cancelable);
      }
      window.dispatchEvent(eventResize)
      
      let eventScroll
      try {
        eventScroll = new Event('scroll')
      }
      catch (e) {
        eventScroll = document.createEvent('Event');
        let doesnt_bubble = false,
            isnt_cancelable = false
        eventScroll.initEvent('scroll', doesnt_bubble, isnt_cancelable);
      }
      window.dispatchEvent(eventScroll)

      return this
    }
  });

  Pace.on('hide', () => {
    setTimeout(() => {
      window.site.obj.init()
    }, 200)
  })
  
})();
