# automate-reports-api

ExcelJS имеет баг, который ломает xlsx файл. Это происходит при вызове:
worksheet.pageSetup.fitToPage = true
Нашел решение на github, но так как автор забросил библиотеку, пришлось
использовать "patch-package" для патча.
https://github.com/exceljs/exceljs/issues/1348


Для работы сервера необходимо:
1. Создать в корне проекта папку xlsx-templates.
В эту папку вложить шаблоны "Приложение №9 ОДПУ.xlsx".
Затем создать в корне проекта файл ".env". В этом файле указать имя шаблона в переменными: 
- ODPY_TEMPLATE
Примеры:
- ODPY_TEMPLATE = odpy_reading_sheet.xlsx

2. В файле .env создать для работы аутентификации:
- SECRET_ACCESS_TOKEN
- SECRET_REFRESH_TOKEN

3. В терминале выполнить скрипт "npm run db:createDb".

4. Создать пользователя выполнив В терминале скрипт "npm run db:createUser имя пароль".
Дополнительные скрипты для работы с дб:
- "npm run db:changeUserPassword имя_пользователя новый_пароль"
- "npm run db:changeUserName изменяемое_имя_пользователя новое_имя_пользователя"

5. Установить зависимости командой "npm install".

Порт по умолчанию 3000, для смены в env файле указать желаемый в переменной PORT.

Для запуска в терминале выполнить: npm run start 


Route http://IP:PORT/api/matritca/
Headers:
- Authorization Bearer Token
Request body:
- upload: xlsx файл с выгрузкой из ПО Sims
- balanceGroup: "private" === Быт | "legal" === Юридические лица
- controller: ФИО сотрудника, поле необходимо, только когда balanceGroup === "private"
Response: xlsx файл | zip с xlsx файлами


Route http://IP:PORT/api/odpy/
Headers:
- Authorization Bearer Token
Request body:
- matritcaOdpy: xlsx файл с выгрузкой из ПО Sims
- piramidaOdpy: xlsx файл с выгрузкой из ПО Пирамида2, 
  отчет "Отчет по показаниям, по тарифам (Сут А+)" с диапазоном в 4 суток
- controller: ФИО сотрудника
Response: zip с xlsx файлами


Route http://IP:PORT/api/login/
Request body:
- login: имя пользователя
- password: пароль пользователя
Response: json { accessToken, refreshToken }


Route http://IP:PORT/api/refresh/
Request body:
- token: refreshToken
Response: json { 
  accessToken: newAccessToken, 
  refreshToken: newRefreshToken, 
}


Route http://IP:PORT/api/logout/
Request body:
- token: refreshToken
Response: successful log out
