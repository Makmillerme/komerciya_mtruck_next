# PDF: виправлення кодування кирилиці (2025-03-17)

## Проблема
Helvetica (за замовчуванням у @react-pdf) не підтримує кирилицю — текст відображався як mojibake (символи замість букв).

## Рішення
Font.register з Roboto TTF (повний шрифт з підтримкою Cyrillic + Latin).

## Файли
- `public/fonts/Roboto-Regular.ttf` — завантажено з https://github.com/googlefonts/roboto (515 KB)
- `lib/ProposalPDFDocument.tsx` — Font.register({ family: "Roboto", src: robotoPath }), fontFamily: "Roboto"

## Джерело шрифту
https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Regular.ttf
