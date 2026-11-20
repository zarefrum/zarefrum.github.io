# Мини-Access

Windows Forms приложение на C# (.NET 8) — мини-аналог Access поверх MySQL.

- список таблиц базы `mini_access`, просмотр данных;
- создание таблицы (`CREATE TABLE`), добавление строки (параметры `@p0, @p1…`), удаление по PK;
- генерация HTML-формы по схеме таблицы (`SHOW COLUMNS`) с предпросмотром в WebView2 и сохранением в `.html`.

## Запуск

1. Запустить MySQL и выполнить в phpMyAdmin:
   ```sql
   CREATE DATABASE IF NOT EXISTS mini_access CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Открыть `MiniAccess.csproj` в Visual Studio, нажать F5.
3. При ошибке «Access denied» поправить пароль в `ConnStr` в `Db.cs`.

NuGet: `MySql.Data`, `Microsoft.Web.WebView2`. Нужен Microsoft Edge WebView2 Runtime.
