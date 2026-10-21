EatWise — marketing website + linked application prototype

СТРУКТУРА
  index.html                  Маркетинг сайт (landing, анимиран)
  assets/style.css            Общ стил за вътрешните страници
  business/index.html         Информация за бизнеса + CTA за регистрация
  register/index.html         Регистрация (клиент / бизнес)
  login/index.html            Вход (демо)
  app/index.html              Клиентско приложение: Surprise Bags
  profile/index.html          Профил и поръчки
  checkout/index.html         Поръчка и плащане (демо)
  business-dashboard/index.html  Партньорски dashboard
  bag-create/index.html       Създаване на Surprise Bag
  admin/index.html            Админ панел

КАК ДА ГО ОТВОРИШ
  Локално: двоен клик върху index.html — всички връзки са относителни и работят
  директно от файловата система.
  На сървър: качи цялата папка в root. Работи и с /business/ стил на URL-и.

ПОТОЦИ (user flows)
  Клиент:  index → app → checkout → profile
  Бизнес:  index → business → register?type=business → business-dashboard → bag-create
  Вход:    login (без параметър → app) | login?type=business → business-dashboard
  Админ:   admin → business-dashboard / app

ВАЖНО
  Това е кликаем front-end прототип. Формите, входът, плащанията, поръчките и
  админ данните са симулирани в браузъра. За продукция е нужно да се свържат
  backend/API, база данни, автентикация, платежен доставчик, известия и
  реални мобилни клиенти.
