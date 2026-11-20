using System.Collections.Generic;
using System.Windows.Forms;

public class AddRowForm : Form
{
    public Dictionary<string, string> Values { get; } = new Dictionary<string, string>();

    public AddRowForm(string table, List<Db.Column> cols)
    {
        Text = "Добавить строку в " + table; Width = 400; Height = 440;
        StartPosition = FormStartPosition.CenterParent;
        FormBorderStyle = FormBorderStyle.FixedDialog; MaximizeBox = false; MinimizeBox = false;

        var grid = new DataGridView
        {
            Top = 10, Left = 10, Width = 360, Height = 330,
            AllowUserToAddRows = false,
            AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill
        };
        grid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Поле", Name = "f", ReadOnly = true });
        grid.Columns.Add(new DataGridViewTextBoxColumn { HeaderText = "Значение", Name = "v" });
        foreach (var c in cols) grid.Rows.Add(c.Name, "");

        var btn = new Button { Text = "OK", Top = 355, Left = 280, Width = 90, DialogResult = DialogResult.OK };
        btn.Click += (s, e) =>
        {
            grid.EndEdit(); // фиксируем последнюю редактируемую ячейку
            foreach (DataGridViewRow row in grid.Rows)
                Values[row.Cells["f"].Value?.ToString()] = row.Cells["v"].Value?.ToString() ?? "";
        };

        Controls.Add(grid); Controls.Add(btn); AcceptButton = btn;
    }
}
