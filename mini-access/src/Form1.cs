using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace MiniAccess
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            RefreshTables();
            Load += Form1_Load;
        }

        // Асинхронная инициализация WebView2 — обязательно до NavigateToString
        private async void Form1_Load(object sender, EventArgs e)
        {
            try
            {
                await webView.EnsureCoreWebView2Async(null);
                webView.NavigateToString(
                    "<html><body style='font-family:sans-serif;color:#888'>" +
                    "Выберите таблицу и нажмите «Сгенерировать»</body></html>");
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "WebView2 не инициализировался: " + ex.Message +
                    "\n\nУстановите Microsoft Edge WebView2 Runtime:\n" +
                    "https://developer.microsoft.com/microsoft-edge/webview2/");
            }
        }

        // ===== Вкладка «Таблицы» =====

        private void RefreshTables()
        {
            List<string> tables;
            try { tables = Db.ListTables(); }
            catch (Exception ex)
            {
                MessageBox.Show("Нет подключения к MySQL: " + ex.Message +
                    "\n\nПроверьте, что MySQL запущен и ConnStr в Db.cs верный.");
                return;
            }
            cbTables.Items.Clear(); cbTables.Items.AddRange(tables.ToArray());
            cbTablesHtml.Items.Clear(); cbTablesHtml.Items.AddRange(tables.ToArray());
            if (cbTables.Items.Count > 0) cbTables.SelectedIndex = 0;
            if (cbTablesHtml.Items.Count > 0) cbTablesHtml.SelectedIndex = 0;
        }

        private void cbTables_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (cbTables.SelectedItem != null) LoadTable(cbTables.SelectedItem.ToString());
        }

        private void LoadTable(string table)
        {
            try { dgvData.DataSource = Db.GetRows(table); }
            catch (Exception ex) { MessageBox.Show(ex.Message, "Ошибка"); }
            dgvData.ReadOnly = true;
            dgvData.AllowUserToAddRows = false;
            dgvData.AllowUserToDeleteRows = false;
        }

        private void btnRefresh_Click(object sender, EventArgs e) => RefreshTables();

        private void btnCreateTable_Click(object sender, EventArgs e)
        {
            using var f = new CreateTableForm();
            if (f.ShowDialog(this) != DialogResult.OK) return;
            try
            {
                Db.CreateTable(f.TableName, f.Columns); RefreshTables();
                cbTables.SelectedItem = f.TableName;
            }
            catch (Exception ex) { MessageBox.Show(ex.Message, "Ошибка"); }
        }

        private void btnAddRow_Click(object sender, EventArgs e)
        {
            if (cbTables.SelectedItem == null) return;
            var t = cbTables.SelectedItem.ToString();
            using var f = new AddRowForm(t, Db.GetSchema(t));
            if (f.ShowDialog(this) != DialogResult.OK) return;
            try { Db.InsertRow(t, f.Values); LoadTable(t); }
            catch (Exception ex) { MessageBox.Show(ex.Message, "Ошибка"); }
        }

        private void btnDeleteRow_Click(object sender, EventArgs e)
        {
            if (cbTables.SelectedItem == null || dgvData.CurrentRow == null) return;
            var t = cbTables.SelectedItem.ToString();
            var pk = Db.GetPk(t);
            if (pk == null) { MessageBox.Show("В таблице нет первичного ключа"); return; }
            if (MessageBox.Show("Удалить строку?", "Подтверждение",
                MessageBoxButtons.YesNo) != DialogResult.Yes) return;
            try
            {
                Db.DeleteRow(t, pk, dgvData.CurrentRow.Cells[pk].Value);
                LoadTable(t);
            }
            catch (Exception ex) { MessageBox.Show(ex.Message, "Ошибка"); }
        }

        // ===== Вкладка «HTML-форма» =====

        private void btnGenerate_Click(object sender, EventArgs e)
        {
            if (cbTablesHtml.SelectedItem == null) return;
            string html = BuildHtml(cbTablesHtml.SelectedItem.ToString());
            txtHtml.Text = html;
            // Показываем HTML-страницу в браузерном движке (не как текст!)
            if (webView.CoreWebView2 != null)
                webView.NavigateToString(html);
        }

        private string BuildHtml(string table)
        {
            var cols = Db.GetSchema(table);
            var sb = new StringBuilder();
            sb.AppendLine("<!DOCTYPE html>");
            sb.AppendLine("<html lang='ru'><head><meta charset='utf-8'>");
            sb.AppendLine("<title>Форма: " + table + "</title>");
            sb.AppendLine("<style>body{font-family:sans-serif;margin:2em}" +
                          "label{display:block;margin:.6em 0}input{width:300px;padding:.3em}" +
                          "button{padding:.5em 1em}</style>");
            sb.AppendLine("</head><body>");
            sb.AppendLine("<h1>Форма: " + table + "</h1>");
            sb.AppendLine("<form method='post' action='save.php'>");
            foreach (var c in cols)
            {
                string t = c.Type.ToLowerInvariant();
                string input =
                    t.Contains("int") || t.Contains("decimal")
                        ? "<input type='number' step='any' name='" + c.Name + "'>"
                        : t.Contains("date")
                            ? "<input type='date' name='" + c.Name + "'>"
                            : "<input type='text' name='" + c.Name + "'>";
                sb.AppendLine("<label>" + c.Name + "<br>" + input + "</label>");
            }
            sb.AppendLine("<button type='submit'>Отправить</button>");
            sb.AppendLine("</form></body></html>");
            return sb.ToString();
        }

        private void btnSaveHtml_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtHtml.Text)) return;
            using var dlg = new SaveFileDialog
            {
                Filter = "HTML (*.html)|*.html",
                FileName = (cbTablesHtml.SelectedItem?.ToString() ?? "form") + ".html"
            };
            if (dlg.ShowDialog() != DialogResult.OK) return;
            File.WriteAllText(dlg.FileName, txtHtml.Text, Encoding.UTF8);
            MessageBox.Show("Сохранено");
        }
    }
}
