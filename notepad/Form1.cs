using System;
using System.IO;
using System.Windows.Forms;

namespace Wordpad
{
    public partial class Form1 : Form
    {
        TextBox textBox = new TextBox();
        string filePath = null; // путь к открытому файлу

        public Form1()
        {
            InitializeComponent();
            Text = "Мой блокнот";

            // Поле для текста на всё окно
            textBox.Multiline = true;
            textBox.ScrollBars = ScrollBars.Both;
            textBox.Dock = DockStyle.Fill;
            textBox.Font = new System.Drawing.Font("Consolas", 12);
            Controls.Add(textBox);

            // Меню "Файл"
            MenuStrip menu = new MenuStrip();
            ToolStripMenuItem file = new ToolStripMenuItem("Файл");
            file.DropDownItems.Add("Новый", null, New_Click);
            file.DropDownItems.Add("Открыть", null, Open_Click);
            file.DropDownItems.Add("Сохранить", null, Save_Click);
            file.DropDownItems.Add("Выход", null, (s, e) => Close());
            menu.Items.Add(file);
            Controls.Add(menu);
            MainMenuStrip = menu;
            textBox.BringToFront();
        }

        void New_Click(object sender, EventArgs e)
        {
            textBox.Clear();
            filePath = null;
        }

        void Open_Click(object sender, EventArgs e)
        {
            OpenFileDialog dlg = new OpenFileDialog();
            dlg.Filter = "Текстовые файлы (*.txt)|*.txt|Все файлы (*.*)|*.*";
            if (dlg.ShowDialog() == DialogResult.OK)
            {
                filePath = dlg.FileName;
                textBox.Text = File.ReadAllText(filePath);
            }
        }

        void Save_Click(object sender, EventArgs e)
        {
            if (filePath == null)
            {
                SaveFileDialog dlg = new SaveFileDialog();
                dlg.Filter = "Текстовые файлы (*.txt)|*.txt";
                if (dlg.ShowDialog() != DialogResult.OK) return;
                filePath = dlg.FileName;
            }
            File.WriteAllText(filePath, textBox.Text);
            MessageBox.Show("Сохранено!");
        }
    }
}
