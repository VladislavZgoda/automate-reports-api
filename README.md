# automate-reports-api

ExcelJS имеет баг, который ломает xlsx файл. Это происходит при вызове:
worksheet.pageSetup.fitToPage = true
Нашел решение на github, но так как автор забросил библиотеку, пришлось
использовать "patch-package" для патча.
https://github.com/exceljs/exceljs/issues/1348

Для работы POST эндпоинта "odpy" необходимо создать в корне проекта папку xlsx-templates.
В эту папку вложить шаблон "Приложение №9.xlsx" для ОДПУ.
Затем создать в корне проекта файл ".env". В этом файле указать имя шаблона в переменной ODPY_TEMPLATE.
ODPY_TEMPLATE = odpy_reading_sheet.xlsx 
