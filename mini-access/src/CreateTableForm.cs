using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Windows.Forms;

public class CreateTableForm : Form
{
    public string TableName { get; private set; }
    public List<Db.Column> Columns { get; } = new List<Db.Column>();

    static readonly Regex NameRx = new Regex("^[A-Za-z_][A-Za-z0-9_]*$");

    public CreateTableForm()
    {
        Text = "Создать таблицу"; Width = 520; Height = 440;
        StartPosition = FormStartPosition.CenterParent;
        FormBorderStyle = FormBorderStyle.FixedDialog; MaximizeBox = false; MinimizeBox = false;

        var lbl = new Label { Text = "Имя таблицы:", Top = 10, Left = 10, Width = 200 };
        var txt = new TextBox { Top = 30, Left = 10, Width = 480 };

        var grid = new DataGridView
        {
            Top = 70, Left = 10, Width = 480, Height = 270,
            AllowUserToAddRows = true,
            AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill
        };
        grid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Имя колонки", Name = "name" });
        var typeCol = new DataGridViewComboBoxColumn { HeaderText = "Тип", Name = "type" };
        typeCol.Items.AddRange(
            "INT AUTO_INCREMENT", "INT", "VARCHAR(100)", "VARCHAR(255)",
            "TEXT", "DECIMAL(10,2)", "DATE", "DATETIME");
        grid.Columns.Add(typeCol);
        grid.Columns.Add(new DataGridViewCheckBoxColumn { HeaderText = "PK", Name = "pk", FillWeight = 30 });

        var btnOk = new Button { Text = "OK", Top = 355, Left = 300, Width = 90 };
        var btnNo = new Button { Text = "Отмена", Top = 355, Left = 400, Width = 90, DialogResult = DialogResult.Cancel };

        btnOk.Click += (s, e) =>
        {
            grid.EndEdit();
            TableName = txt.Text.Trim();
            if (!NameRx.IsMatch(TableName))
            {
                MessageBox.Show("Имя таблицы: только латиница, цифры и _, не с цифры.");
                return;
            }

            Columns.Clear();
            int pkCount = 0;
            foreach (DataGridViewRow row in grid.Rows)
            {
                if (row.IsNewRow) continue;
                string name = row.Cells["name"].Value?.ToString()?.Trim();
                string type = row.Cells["type"].Value?.ToString();
                bool pk = row.Cells["pk"].Value is bool b && b;
                if (string.IsNullOrEmpty(name) && string.IsNullOrEmpty(type)) continue;

                if (string.IsNullOrEmpty(name) || !NameRx.IsMatch(name))
                { MessageBox.Show("Неверное имя колонки: " + name); return; }
                if (string.IsNullOrEmpty(type))
                { MessageBox.Show("Не выбран тип у колонки " + name); return; }

                if (pk) pkCount++;
                Columns.Add(new Db.Column { Name = name, Type = type, IsPk = pk });
            }

            if (Columns.Count == 0) { MessageBox.Show("Добавьте хотя бы одну колонку."); return; }
            if (pkCount > 1) { MessageBox.Show("PK может быть только у одной колонки."); return; }

            DialogResult = DialogResult.OK; // закрывает диалог
        };

        Controls.Add(lbl); Controls.Add(txt); Controls.Add(grid);
        Controls.Add(btnOk); Controls.Add(btnNo);
        AcceptButton = btnOk; CancelButton = btnNo;
    }
}
