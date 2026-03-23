# serena

Виконуй усі завдання з коду через **Serena MCP** (user-serena) — не вручну через search_replace/write.

## Перед початком

1. **Активуй проєкт:** `call_mcp_tool` → server `user-serena`, tool `activate_project`, args `{"project": "nextjs_vmd"}`
2. Проєкт: `nextjs_vmd` (шлях: `d:\Project\mtruck\new_nodejs_vmd_parser\nextjs_vmd`)

## Доступні інструменти (активні)

| Інструмент | Призначення |
|------------|-------------|
| `activate_project` | Активація проєкту (nextjs_vmd) |
| `find_symbol` | Пошук символів за name_path_pattern. Параметри: name_path_pattern, relative_path?, depth?, include_body?, substring_matching? |
| `get_symbols_overview` | Огляд символів у файлі. Параметр: relative_path |
| `replace_symbol_body` | Замінити тіло символу. Параметри: name_path, relative_path, body |
| `insert_after_symbol` | Вставити після символу. Параметри: name_path, relative_path, body |
| `insert_before_symbol` | Вставити перед символу. Параметри: name_path, relative_path, body |
| `replace_content` | Заміна патерну (literal або regex). Параметри: relative_path, needle, repl, mode, allow_multiple_occurrences? |
| `find_referencing_symbols` | Знайти посилання на символ |
| `search_for_pattern` | Пошук патерну в проєкті |
| `read_file` | Читання файлу |
| `create_text_file` | Створення/перезапис файлу |
| `list_dir` | Список файлів у директорії |
| `find_file` | Пошук файлу за ім'ям |
| `write_memory` | Записати в памʼять. Параметри: memory_name, content |
| `read_memory` | Прочитати памʼять |
| `edit_memory` | Редагувати існуючу памʼять |
| `rename_memory` | Перейменувати памʼять |
| `delete_memory` | Видалити памʼять |
| `list_memories` | Список памʼяток |
| `rename_symbol` | Перейменувати символ з оновленням посилань |
| `get_current_config` | Поточна конфігурація Serena |
| `check_onboarding_performed` | Перевірка onboarding |
| `onboarding` | Онбординг проєкту |
| `prepare_for_new_conversation` | Інструкції для нової розмови |
| `initial_instructions` | Початкові інструкції |
| `switch_modes` | Перемикання режимів |
| `execute_shell_command` | Виконання shell-команди |

## Неактивні (доступні через switch_modes)

`delete_lines`, `insert_at_line`, `replace_lines`, `restart_language_server`, `summarize_changes`, `think_about_*`

## Workflow

1. **Пошук:** `find_symbol` (name_path_pattern, relative_path) або `get_symbols_overview` (relative_path)
2. **Заміна тіла:** `replace_symbol_body` (name_path, relative_path, body)
3. **Вставка:** `insert_before_symbol` / `insert_after_symbol`
4. **Рядкова заміна:** `replace_content` (mode: literal або regex)

**name_path:** шлях у дереві символів, напр. `MyClass/myMethod` або `/ComponentName` для точного збігу.

## Після змін

`write_memory` з memory_name (напр. `bugfixes/feature-name`) та content для запису в `.serena/memories/`.

Ця команда доступна в чаті як /serena
