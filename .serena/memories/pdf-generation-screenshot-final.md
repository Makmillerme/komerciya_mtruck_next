## PDF Generation — Screenshot (фінальний підхід)

**Проблема:** page.pdf() створював 4 сторінки замість 2, не відповідав превʼю.

**Рішення:** Повернення до screenshot + pdf-lib. Скріншоти [data-page="1"] та [data-page="2"] дають точну копію превʼю, завжди 2 сторінки.

**Реалізація:**
- app/api/generate: Playwright viewport deviceScaleFactor 4, screenshot обох data-page елементів, pdf-lib embedPng + drawImage на A4
- Видалено print CSS з layout (не потрібен для screenshot)
- Спрощено ConditionalLayout, ProposalTemplate

**Якість:** deviceScaleFactor 4 ≈ 300 DPI. Вага PDF не критична.