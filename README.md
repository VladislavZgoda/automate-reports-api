# automate-reports-api

ExcelJS имеет баг, который ломает xlsx файл. Это происходит при вызове:
worksheet.pageSetup.fitToPage = true
Нашел решение на github, но так как автор забросил библиотеку, пришлось
использовать "patch-package" для патча.
https://github.com/exceljs/exceljs/issues/1348


Для работы сервера необходимо создать в корне проекта папку xlsx-templates.
В эту папку вложить шаблоны "Приложение №9 ОДПУ.xlsx".
Затем создать в корне проекта файл ".env". В этом файле указать имя шаблона в переменными: 
- ODPY_TEMPLATE
Примеры:
- ODPY_TEMPLATE = odpy_reading_sheet.xlsx

Порт по умолчанию 3000, для смены в env файле указать желаемый в переменной PORT.

Для запуска в терминале выполнить: npm run start 


Route http://IP:PORT/api/matritca/
Form data fields:
- upload: xlsx файл с выгрузкой из ПО Sims
- balanceGroup: "private" === Быт | "legal" === Юридические лица
- controller: ФИО сотрудника, поле необходимо, только когда balanceGroup === "private"


Route http://IP:PORT/api/odpy/
Form data fields:
- matritcaOdpy: xlsx файл с выгрузкой из ПО Sims
- piramidaOdpy: xlsx файл с выгрузкой из ПО Пирамида2, 
  отчет "Отчет по показаниям, по тарифам (Сут А+)" с диапазоном в 4 суток
- controller: ФИО сотрудника
