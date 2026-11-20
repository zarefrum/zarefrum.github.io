namespace MiniAccess
{
    partial class Form1
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null)) components.Dispose();
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        private void InitializeComponent()
        {
            this.tabControl1 = new System.Windows.Forms.TabControl();
            this.tabTables = new System.Windows.Forms.TabPage();
            this.dgvData = new System.Windows.Forms.DataGridView();
            this.panelTablesTop = new System.Windows.Forms.Panel();
            this.btnDeleteRow = new System.Windows.Forms.Button();
            this.btnAddRow = new System.Windows.Forms.Button();
            this.btnCreateTable = new System.Windows.Forms.Button();
            this.btnRefresh = new System.Windows.Forms.Button();
            this.cbTables = new System.Windows.Forms.ComboBox();
            this.tabHtml = new System.Windows.Forms.TabPage();
            this.splitHtml = new System.Windows.Forms.SplitContainer();
            this.txtHtml = new System.Windows.Forms.TextBox();
            this.webView = new Microsoft.Web.WebView2.WinForms.WebView2();
            this.panelHtmlTop = new System.Windows.Forms.Panel();
            this.btnSaveHtml = new System.Windows.Forms.Button();
            this.btnGenerate = new System.Windows.Forms.Button();
            this.cbTablesHtml = new System.Windows.Forms.ComboBox();
            this.tabControl1.SuspendLayout();
            this.tabTables.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dgvData)).BeginInit();
            this.panelTablesTop.SuspendLayout();
            this.tabHtml.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitHtml)).BeginInit();
            this.splitHtml.Panel1.SuspendLayout();
            this.splitHtml.Panel2.SuspendLayout();
            this.splitHtml.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.webView)).BeginInit();
            this.panelHtmlTop.SuspendLayout();
            this.SuspendLayout();
            //
            // tabControl1
            //
            this.tabControl1.Controls.Add(this.tabTables);
            this.tabControl1.Controls.Add(this.tabHtml);
            this.tabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tabControl1.Location = new System.Drawing.Point(0, 0);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(900, 600);
            this.tabControl1.TabIndex = 0;
            //
            // tabTables
            //
            this.tabTables.Controls.Add(this.dgvData);
            this.tabTables.Controls.Add(this.panelTablesTop);
            this.tabTables.Location = new System.Drawing.Point(4, 24);
            this.tabTables.Name = "tabTables";
            this.tabTables.Padding = new System.Windows.Forms.Padding(3);
            this.tabTables.Size = new System.Drawing.Size(892, 572);
            this.tabTables.TabIndex = 0;
            this.tabTables.Text = "Таблицы";
            this.tabTables.UseVisualStyleBackColor = true;
            //
            // dgvData
            //
            this.dgvData.AllowUserToAddRows = false;
            this.dgvData.AllowUserToDeleteRows = false;
            this.dgvData.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dgvData.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dgvData.Location = new System.Drawing.Point(3, 43);
            this.dgvData.MultiSelect = false;
            this.dgvData.Name = "dgvData";
            this.dgvData.ReadOnly = true;
            this.dgvData.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dgvData.Size = new System.Drawing.Size(886, 526);
            this.dgvData.TabIndex = 1;
            //
            // panelTablesTop
            //
            this.panelTablesTop.Controls.Add(this.btnDeleteRow);
            this.panelTablesTop.Controls.Add(this.btnAddRow);
            this.panelTablesTop.Controls.Add(this.btnCreateTable);
            this.panelTablesTop.Controls.Add(this.btnRefresh);
            this.panelTablesTop.Controls.Add(this.cbTables);
            this.panelTablesTop.Dock = System.Windows.Forms.DockStyle.Top;
            this.panelTablesTop.Location = new System.Drawing.Point(3, 3);
            this.panelTablesTop.Name = "panelTablesTop";
            this.panelTablesTop.Size = new System.Drawing.Size(886, 40);
            this.panelTablesTop.TabIndex = 0;
            //
            // cbTables
            //
            this.cbTables.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cbTables.Location = new System.Drawing.Point(6, 9);
            this.cbTables.Name = "cbTables";
            this.cbTables.Size = new System.Drawing.Size(200, 23);
            this.cbTables.TabIndex = 0;
            this.cbTables.SelectedIndexChanged += new System.EventHandler(this.cbTables_SelectedIndexChanged);
            //
            // btnRefresh
            //
            this.btnRefresh.Location = new System.Drawing.Point(215, 8);
            this.btnRefresh.Name = "btnRefresh";
            this.btnRefresh.Size = new System.Drawing.Size(100, 26);
            this.btnRefresh.TabIndex = 1;
            this.btnRefresh.Text = "Обновить";
            this.btnRefresh.UseVisualStyleBackColor = true;
            this.btnRefresh.Click += new System.EventHandler(this.btnRefresh_Click);
            //
            // btnCreateTable
            //
            this.btnCreateTable.Location = new System.Drawing.Point(321, 8);
            this.btnCreateTable.Name = "btnCreateTable";
            this.btnCreateTable.Size = new System.Drawing.Size(130, 26);
            this.btnCreateTable.TabIndex = 2;
            this.btnCreateTable.Text = "Создать таблицу";
            this.btnCreateTable.UseVisualStyleBackColor = true;
            this.btnCreateTable.Click += new System.EventHandler(this.btnCreateTable_Click);
            //
            // btnAddRow
            //
            this.btnAddRow.Location = new System.Drawing.Point(457, 8);
            this.btnAddRow.Name = "btnAddRow";
            this.btnAddRow.Size = new System.Drawing.Size(130, 26);
            this.btnAddRow.TabIndex = 3;
            this.btnAddRow.Text = "Добавить строку";
            this.btnAddRow.UseVisualStyleBackColor = true;
            this.btnAddRow.Click += new System.EventHandler(this.btnAddRow_Click);
            //
            // btnDeleteRow
            //
            this.btnDeleteRow.Location = new System.Drawing.Point(593, 8);
            this.btnDeleteRow.Name = "btnDeleteRow";
            this.btnDeleteRow.Size = new System.Drawing.Size(130, 26);
            this.btnDeleteRow.TabIndex = 4;
            this.btnDeleteRow.Text = "Удалить строку";
            this.btnDeleteRow.UseVisualStyleBackColor = true;
            this.btnDeleteRow.Click += new System.EventHandler(this.btnDeleteRow_Click);
            //
            // tabHtml
            //
            this.tabHtml.Controls.Add(this.splitHtml);
            this.tabHtml.Controls.Add(this.panelHtmlTop);
            this.tabHtml.Location = new System.Drawing.Point(4, 24);
            this.tabHtml.Name = "tabHtml";
            this.tabHtml.Padding = new System.Windows.Forms.Padding(3);
            this.tabHtml.Size = new System.Drawing.Size(892, 572);
            this.tabHtml.TabIndex = 1;
            this.tabHtml.Text = "HTML-форма";
            this.tabHtml.UseVisualStyleBackColor = true;
            //
            // splitHtml
            //
            this.splitHtml.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitHtml.Location = new System.Drawing.Point(3, 43);
            this.splitHtml.Name = "splitHtml";
            this.splitHtml.Orientation = System.Windows.Forms.Orientation.Horizontal;
            this.splitHtml.Panel1.Controls.Add(this.txtHtml);
            this.splitHtml.Panel2.Controls.Add(this.webView);
            this.splitHtml.Size = new System.Drawing.Size(886, 526);
            this.splitHtml.SplitterDistance = 200;
            this.splitHtml.TabIndex = 1;
            //
            // txtHtml
            //
            this.txtHtml.Dock = System.Windows.Forms.DockStyle.Fill;
            this.txtHtml.Font = new System.Drawing.Font("Consolas", 11F);
            this.txtHtml.Location = new System.Drawing.Point(0, 0);
            this.txtHtml.Multiline = true;
            this.txtHtml.Name = "txtHtml";
            this.txtHtml.ReadOnly = true;
            this.txtHtml.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.txtHtml.Size = new System.Drawing.Size(886, 200);
            this.txtHtml.TabIndex = 0;
            this.txtHtml.WordWrap = false;
            //
            // webView
            //
            this.webView.AllowExternalDrop = true;
            this.webView.CreationProperties = null;
            this.webView.DefaultBackgroundColor = System.Drawing.Color.White;
            this.webView.Dock = System.Windows.Forms.DockStyle.Fill;
            this.webView.Location = new System.Drawing.Point(0, 0);
            this.webView.Name = "webView";
            this.webView.Size = new System.Drawing.Size(886, 322);
            this.webView.TabIndex = 0;
            this.webView.ZoomFactor = 1D;
            //
            // panelHtmlTop
            //
            this.panelHtmlTop.Controls.Add(this.btnSaveHtml);
            this.panelHtmlTop.Controls.Add(this.btnGenerate);
            this.panelHtmlTop.Controls.Add(this.cbTablesHtml);
            this.panelHtmlTop.Dock = System.Windows.Forms.DockStyle.Top;
            this.panelHtmlTop.Location = new System.Drawing.Point(3, 3);
            this.panelHtmlTop.Name = "panelHtmlTop";
            this.panelHtmlTop.Size = new System.Drawing.Size(886, 40);
            this.panelHtmlTop.TabIndex = 0;
            //
            // cbTablesHtml
            //
            this.cbTablesHtml.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cbTablesHtml.Location = new System.Drawing.Point(6, 9);
            this.cbTablesHtml.Name = "cbTablesHtml";
            this.cbTablesHtml.Size = new System.Drawing.Size(200, 23);
            this.cbTablesHtml.TabIndex = 0;
            //
            // btnGenerate
            //
            this.btnGenerate.Location = new System.Drawing.Point(215, 8);
            this.btnGenerate.Name = "btnGenerate";
            this.btnGenerate.Size = new System.Drawing.Size(130, 26);
            this.btnGenerate.TabIndex = 1;
            this.btnGenerate.Text = "Сгенерировать";
            this.btnGenerate.UseVisualStyleBackColor = true;
            this.btnGenerate.Click += new System.EventHandler(this.btnGenerate_Click);
            //
            // btnSaveHtml
            //
            this.btnSaveHtml.Location = new System.Drawing.Point(351, 8);
            this.btnSaveHtml.Name = "btnSaveHtml";
            this.btnSaveHtml.Size = new System.Drawing.Size(110, 26);
            this.btnSaveHtml.TabIndex = 2;
            this.btnSaveHtml.Text = "Сохранить...";
            this.btnSaveHtml.UseVisualStyleBackColor = true;
            this.btnSaveHtml.Click += new System.EventHandler(this.btnSaveHtml_Click);
            //
            // Form1
            //
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(900, 600);
            this.Controls.Add(this.tabControl1);
            this.Name = "Form1";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Мини-Access";
            this.tabControl1.ResumeLayout(false);
            this.tabTables.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.dgvData)).EndInit();
            this.panelTablesTop.ResumeLayout(false);
            this.tabHtml.ResumeLayout(false);
            this.splitHtml.Panel1.ResumeLayout(false);
            this.splitHtml.Panel1.PerformLayout();
            this.splitHtml.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitHtml)).EndInit();
            this.splitHtml.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.webView)).EndInit();
            this.panelHtmlTop.ResumeLayout(false);
            this.ResumeLayout(false);
        }

        #endregion

        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage tabTables;
        private System.Windows.Forms.TabPage tabHtml;
        private System.Windows.Forms.Panel panelTablesTop;
        private System.Windows.Forms.ComboBox cbTables;
        private System.Windows.Forms.Button btnRefresh;
        private System.Windows.Forms.Button btnCreateTable;
        private System.Windows.Forms.Button btnAddRow;
        private System.Windows.Forms.Button btnDeleteRow;
        private System.Windows.Forms.DataGridView dgvData;
        private System.Windows.Forms.Panel panelHtmlTop;
        private System.Windows.Forms.ComboBox cbTablesHtml;
        private System.Windows.Forms.Button btnGenerate;
        private System.Windows.Forms.Button btnSaveHtml;
        private System.Windows.Forms.SplitContainer splitHtml;
        private System.Windows.Forms.TextBox txtHtml;
        private Microsoft.Web.WebView2.WinForms.WebView2 webView;
    }
}
