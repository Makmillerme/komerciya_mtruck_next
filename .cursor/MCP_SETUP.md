# MCP налаштування для new_nodejs_vmd_parser

## Проєкт

- **Next.js додаток:** `nextjs_vmd/` (Prisma, Better-Auth, Shadcn)
- **База даних:** PostgreSQL (локально, пароль: Rty45678+)

## Serena (user-serena)

**Призначення:** Редагування коду через символьний аналіз (LSP) — точні правки без переписування файлів.

**Проєкт:** `nextjs_vmd`  
**Шлях:** `d:\Project\mtruck\new_nodejs_vmd_parser\nextjs_vmd`

### Активація

При виклику /serena або перед редагуванням:
```
call_mcp_tool: server=user-serena, tool=activate_project, args={"project": "nextjs_vmd"}
```

### Активні інструменти (перевірено 2026-02)

| Інструмент | Призначення |
|------------|-------------|
| activate_project | Активація проєкту |
| find_symbol | Пошук символів (name_path_pattern, relative_path) |
| get_symbols_overview | Огляд символів у файлі |
| replace_symbol_body | Заміна тіла символу |
| insert_after_symbol | Вставка після символу |
| insert_before_symbol | Вставка перед символу |
| replace_content | Заміна патерну (literal/regex) |
| find_referencing_symbols | Пошук посилань на символ |
| search_for_pattern | Пошук патерну в проєкті |
| read_file | Читання файлу |
| create_text_file | Створення файлу |
| list_dir | Список файлів |
| find_file | Пошук файлу |
| write_memory | Запис у памʼять проєкту |
| read_memory | Читання памʼяті |
| edit_memory | Редагування памʼяті |
| rename_memory | Перейменування памʼяті |
| delete_memory | Видалення памʼяті |
| list_memories | Список памʼяток |
| rename_symbol | Перейменування символу з оновленням посилань |
| get_current_config | Поточна конфігурація |
| execute_shell_command | Виконання shell-команди |

### Неактивні (доступні через switch_modes)

delete_lines, insert_at_line, replace_lines, restart_language_server, summarize_changes, think_about_*

### Конфігурація MCP

```json
{
  "mcpServers": {
    "user-serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server"
      ]
    }
  }
}
```

### Інші MCP сервери

- user-shadcn, user-github, user-filesystem, user-next-devtools, user-sequential-thinking

## Не використовується

- **payloadcms-local** — проєкт на Prisma

## Команди Cursor

| Команда | Опис |
|---------|------|
| /plan | Sequential-thinking для планування |
| /docs | Отримати актуальну документацію |
| /serena | Виконувати завдання через Serena MCP |
| /sync | Логувати зміни в Serena |
| /init | Ініціалізація проєкту |
| /audit | Аудит коду |
| /ui-add | Додати UI компонент |
| /bot-init | Ініціалізація бота |
