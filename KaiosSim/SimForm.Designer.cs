namespace KaiosSim
{
    partial class SimForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(SimForm));
            this.browserPanel = new System.Windows.Forms.Panel();
            this.label1 = new System.Windows.Forms.Label();
            this.panel_softkey = new System.Windows.Forms.Panel();
            this.btnsharp = new System.Windows.Forms.Button();
            this.btn0 = new System.Windows.Forms.Button();
            this.btnstar = new System.Windows.Forms.Button();
            this.btn9 = new System.Windows.Forms.Button();
            this.btn8 = new System.Windows.Forms.Button();
            this.btn7 = new System.Windows.Forms.Button();
            this.btn6 = new System.Windows.Forms.Button();
            this.btn5 = new System.Windows.Forms.Button();
            this.btn4 = new System.Windows.Forms.Button();
            this.btn3 = new System.Windows.Forms.Button();
            this.btn2 = new System.Windows.Forms.Button();
            this.btn1 = new System.Windows.Forms.Button();
            this.btn_up = new System.Windows.Forms.Button();
            this.btn_down = new System.Windows.Forms.Button();
            this.btn_left = new System.Windows.Forms.Button();
            this.btn_right = new System.Windows.Forms.Button();
            this.btn_ok = new System.Windows.Forms.Button();
            this.btn_rightsoft = new System.Windows.Forms.Button();
            this.btn_leftsoft = new System.Windows.Forms.Button();
            this.menuStrip1 = new System.Windows.Forms.MenuStrip();
            this.toolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.刷新ToolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.旋转屏幕ToolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.切换分辨率ToolStripMenuItem1 = new System.Windows.Forms.ToolStripMenuItem();
            this.pictureBox1 = new System.Windows.Forms.PictureBox();
            this.browserPanel.SuspendLayout();
            this.panel_softkey.SuspendLayout();
            this.menuStrip1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).BeginInit();
            this.SuspendLayout();
            // 
            // browserPanel
            // 
            this.browserPanel.BackColor = System.Drawing.Color.Transparent;
            this.browserPanel.Controls.Add(this.pictureBox1);
            this.browserPanel.Controls.Add(this.label1);
            this.browserPanel.Location = new System.Drawing.Point(15, 36);
            this.browserPanel.Name = "browserPanel";
            this.browserPanel.Size = new System.Drawing.Size(240, 320);
            this.browserPanel.TabIndex = 0;
            // 
            // label1
            // 
            this.label1.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.label1.AutoSize = true;
            this.label1.BackColor = System.Drawing.Color.Transparent;
            this.label1.ForeColor = System.Drawing.Color.Transparent;
            this.label1.Location = new System.Drawing.Point(199, 8);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(41, 12);
            this.label1.TabIndex = 1;
            this.label1.Text = "label1";
            // 
            // panel_softkey
            // 
            this.panel_softkey.Controls.Add(this.btnsharp);
            this.panel_softkey.Controls.Add(this.btn0);
            this.panel_softkey.Controls.Add(this.btnstar);
            this.panel_softkey.Controls.Add(this.btn9);
            this.panel_softkey.Controls.Add(this.btn8);
            this.panel_softkey.Controls.Add(this.btn7);
            this.panel_softkey.Controls.Add(this.btn6);
            this.panel_softkey.Controls.Add(this.btn5);
            this.panel_softkey.Controls.Add(this.btn4);
            this.panel_softkey.Controls.Add(this.btn3);
            this.panel_softkey.Controls.Add(this.btn2);
            this.panel_softkey.Controls.Add(this.btn1);
            this.panel_softkey.Controls.Add(this.btn_up);
            this.panel_softkey.Controls.Add(this.btn_down);
            this.panel_softkey.Controls.Add(this.btn_left);
            this.panel_softkey.Controls.Add(this.btn_right);
            this.panel_softkey.Controls.Add(this.btn_ok);
            this.panel_softkey.Controls.Add(this.btn_rightsoft);
            this.panel_softkey.Controls.Add(this.btn_leftsoft);
            this.panel_softkey.Location = new System.Drawing.Point(15, 372);
            this.panel_softkey.Name = "panel_softkey";
            this.panel_softkey.Size = new System.Drawing.Size(240, 266);
            this.panel_softkey.TabIndex = 1;
            // 
            // btnsharp
            // 
            this.btnsharp.Location = new System.Drawing.Point(162, 233);
            this.btnsharp.Name = "btnsharp";
            this.btnsharp.Size = new System.Drawing.Size(75, 26);
            this.btnsharp.TabIndex = 18;
            this.btnsharp.TabStop = false;
            this.btnsharp.Text = "#";
            this.btnsharp.UseVisualStyleBackColor = true;
            this.btnsharp.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btnsharp.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn0
            // 
            this.btn0.Location = new System.Drawing.Point(84, 233);
            this.btn0.Name = "btn0";
            this.btn0.Size = new System.Drawing.Size(75, 26);
            this.btn0.TabIndex = 17;
            this.btn0.TabStop = false;
            this.btn0.Text = "0";
            this.btn0.UseVisualStyleBackColor = true;
            this.btn0.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn0.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btnstar
            // 
            this.btnstar.Location = new System.Drawing.Point(3, 233);
            this.btnstar.Name = "btnstar";
            this.btnstar.Size = new System.Drawing.Size(75, 26);
            this.btnstar.TabIndex = 16;
            this.btnstar.TabStop = false;
            this.btnstar.Text = "*";
            this.btnstar.UseVisualStyleBackColor = true;
            this.btnstar.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btnstar.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn9
            // 
            this.btn9.Location = new System.Drawing.Point(162, 201);
            this.btn9.Name = "btn9";
            this.btn9.Size = new System.Drawing.Size(75, 26);
            this.btn9.TabIndex = 15;
            this.btn9.TabStop = false;
            this.btn9.Text = "9";
            this.btn9.UseVisualStyleBackColor = true;
            this.btn9.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn9.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn8
            // 
            this.btn8.Location = new System.Drawing.Point(84, 201);
            this.btn8.Name = "btn8";
            this.btn8.Size = new System.Drawing.Size(75, 26);
            this.btn8.TabIndex = 14;
            this.btn8.TabStop = false;
            this.btn8.Text = "8";
            this.btn8.UseVisualStyleBackColor = true;
            this.btn8.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn8.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn7
            // 
            this.btn7.Location = new System.Drawing.Point(3, 201);
            this.btn7.Name = "btn7";
            this.btn7.Size = new System.Drawing.Size(75, 26);
            this.btn7.TabIndex = 13;
            this.btn7.TabStop = false;
            this.btn7.Text = "7";
            this.btn7.UseVisualStyleBackColor = true;
            this.btn7.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn7.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn6
            // 
            this.btn6.Location = new System.Drawing.Point(162, 169);
            this.btn6.Name = "btn6";
            this.btn6.Size = new System.Drawing.Size(75, 26);
            this.btn6.TabIndex = 12;
            this.btn6.TabStop = false;
            this.btn6.Text = "6";
            this.btn6.UseVisualStyleBackColor = true;
            this.btn6.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn6.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn5
            // 
            this.btn5.Location = new System.Drawing.Point(84, 169);
            this.btn5.Name = "btn5";
            this.btn5.Size = new System.Drawing.Size(75, 26);
            this.btn5.TabIndex = 11;
            this.btn5.TabStop = false;
            this.btn5.Text = "5";
            this.btn5.UseVisualStyleBackColor = true;
            this.btn5.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn5.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn4
            // 
            this.btn4.Location = new System.Drawing.Point(3, 169);
            this.btn4.Name = "btn4";
            this.btn4.Size = new System.Drawing.Size(75, 26);
            this.btn4.TabIndex = 10;
            this.btn4.TabStop = false;
            this.btn4.Text = "4";
            this.btn4.UseVisualStyleBackColor = true;
            this.btn4.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn4.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn3
            // 
            this.btn3.Location = new System.Drawing.Point(162, 137);
            this.btn3.Name = "btn3";
            this.btn3.Size = new System.Drawing.Size(75, 26);
            this.btn3.TabIndex = 9;
            this.btn3.TabStop = false;
            this.btn3.Text = "3";
            this.btn3.UseVisualStyleBackColor = true;
            this.btn3.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn3.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn2
            // 
            this.btn2.Location = new System.Drawing.Point(84, 137);
            this.btn2.Name = "btn2";
            this.btn2.Size = new System.Drawing.Size(75, 26);
            this.btn2.TabIndex = 8;
            this.btn2.TabStop = false;
            this.btn2.Text = "2";
            this.btn2.UseVisualStyleBackColor = true;
            this.btn2.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn2.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn1
            // 
            this.btn1.Location = new System.Drawing.Point(3, 137);
            this.btn1.Name = "btn1";
            this.btn1.Size = new System.Drawing.Size(75, 26);
            this.btn1.TabIndex = 7;
            this.btn1.TabStop = false;
            this.btn1.Text = "1";
            this.btn1.UseVisualStyleBackColor = true;
            this.btn1.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn1.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn_up
            // 
            this.btn_up.Location = new System.Drawing.Point(94, 9);
            this.btn_up.Name = "btn_up";
            this.btn_up.Size = new System.Drawing.Size(51, 31);
            this.btn_up.TabIndex = 6;
            this.btn_up.TabStop = false;
            this.btn_up.Text = "上";
            this.btn_up.UseVisualStyleBackColor = true;
            this.btn_up.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn_up.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn_down
            // 
            this.btn_down.Location = new System.Drawing.Point(94, 97);
            this.btn_down.Name = "btn_down";
            this.btn_down.Size = new System.Drawing.Size(51, 31);
            this.btn_down.TabIndex = 5;
            this.btn_down.TabStop = false;
            this.btn_down.Text = "下";
            this.btn_down.UseVisualStyleBackColor = true;
            this.btn_down.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn_down.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn_left
            // 
            this.btn_left.Location = new System.Drawing.Point(37, 53);
            this.btn_left.Name = "btn_left";
            this.btn_left.Size = new System.Drawing.Size(51, 31);
            this.btn_left.TabIndex = 4;
            this.btn_left.TabStop = false;
            this.btn_left.Text = "左";
            this.btn_left.UseVisualStyleBackColor = true;
            this.btn_left.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn_left.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn_right
            // 
            this.btn_right.Location = new System.Drawing.Point(151, 53);
            this.btn_right.Name = "btn_right";
            this.btn_right.Size = new System.Drawing.Size(51, 31);
            this.btn_right.TabIndex = 3;
            this.btn_right.TabStop = false;
            this.btn_right.Text = "右";
            this.btn_right.UseVisualStyleBackColor = true;
            this.btn_right.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn_right.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn_ok
            // 
            this.btn_ok.Location = new System.Drawing.Point(94, 46);
            this.btn_ok.Name = "btn_ok";
            this.btn_ok.Size = new System.Drawing.Size(51, 45);
            this.btn_ok.TabIndex = 2;
            this.btn_ok.TabStop = false;
            this.btn_ok.Text = "OK键";
            this.btn_ok.UseVisualStyleBackColor = true;
            this.btn_ok.MouseDown += new System.Windows.Forms.MouseEventHandler(this.btnMouseDown);
            this.btn_ok.MouseUp += new System.Windows.Forms.MouseEventHandler(this.btnMouseUp);
            // 
            // btn_rightsoft
            // 
            this.btn_rightsoft.Location = new System.Drawing.Point(162, 3);
            this.btn_rightsoft.Name = "btn_rightsoft";
            this.btn_rightsoft.Size = new System.Drawing.Size(75, 26);
            this.btn_rightsoft.TabIndex = 1;
            this.btn_rightsoft.TabStop = false;
            this.btn_rightsoft.Text = "右软键";
            this.btn_rightsoft.UseVisualStyleBackColor = true;
            this.btn_rightsoft.Click += new System.EventHandler(this.btn_rightsoft_Click);
            // 
            // btn_leftsoft
            // 
            this.btn_leftsoft.Location = new System.Drawing.Point(3, 3);
            this.btn_leftsoft.Name = "btn_leftsoft";
            this.btn_leftsoft.Size = new System.Drawing.Size(75, 26);
            this.btn_leftsoft.TabIndex = 0;
            this.btn_leftsoft.TabStop = false;
            this.btn_leftsoft.Text = "左软键";
            this.btn_leftsoft.UseVisualStyleBackColor = true;
            this.btn_leftsoft.Click += new System.EventHandler(this.btn_leftsoft_Click);
            // 
            // menuStrip1
            // 
            this.menuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolStripMenuItem1});
            this.menuStrip1.Location = new System.Drawing.Point(0, 0);
            this.menuStrip1.Name = "menuStrip1";
            this.menuStrip1.Size = new System.Drawing.Size(276, 25);
            this.menuStrip1.TabIndex = 2;
            this.menuStrip1.Text = "menuStrip1";
            // 
            // toolStripMenuItem1
            // 
            this.toolStripMenuItem1.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.刷新ToolStripMenuItem1,
            this.旋转屏幕ToolStripMenuItem1,
            this.切换分辨率ToolStripMenuItem1});
            this.toolStripMenuItem1.Name = "toolStripMenuItem1";
            this.toolStripMenuItem1.Size = new System.Drawing.Size(44, 21);
            this.toolStripMenuItem1.Text = "选项";
            // 
            // 刷新ToolStripMenuItem1
            // 
            this.刷新ToolStripMenuItem1.Name = "刷新ToolStripMenuItem1";
            this.刷新ToolStripMenuItem1.Size = new System.Drawing.Size(136, 22);
            this.刷新ToolStripMenuItem1.Text = "刷新";
            this.刷新ToolStripMenuItem1.Click += new System.EventHandler(this.刷新ToolStripMenuItem1_Click);
            // 
            // 旋转屏幕ToolStripMenuItem1
            // 
            this.旋转屏幕ToolStripMenuItem1.Name = "旋转屏幕ToolStripMenuItem1";
            this.旋转屏幕ToolStripMenuItem1.Size = new System.Drawing.Size(136, 22);
            this.旋转屏幕ToolStripMenuItem1.Text = "旋转屏幕";
            this.旋转屏幕ToolStripMenuItem1.Click += new System.EventHandler(this.旋转屏幕ToolStripMenuItem1_Click);
            // 
            // 切换分辨率ToolStripMenuItem1
            // 
            this.切换分辨率ToolStripMenuItem1.Name = "切换分辨率ToolStripMenuItem1";
            this.切换分辨率ToolStripMenuItem1.Size = new System.Drawing.Size(136, 22);
            this.切换分辨率ToolStripMenuItem1.Text = "切换分辨率";
            this.切换分辨率ToolStripMenuItem1.Click += new System.EventHandler(this.切换分辨率ToolStripMenuItem1_Click);
            // 
            // pictureBox1
            // 
            this.pictureBox1.Dock = System.Windows.Forms.DockStyle.Top;
            this.pictureBox1.Image = ((System.Drawing.Image)(resources.GetObject("pictureBox1.Image")));
            this.pictureBox1.Location = new System.Drawing.Point(0, 0);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.Size = new System.Drawing.Size(240, 26);
            this.pictureBox1.TabIndex = 2;
            this.pictureBox1.TabStop = false;
            // 
            // SimForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(276, 657);
            this.Controls.Add(this.menuStrip1);
            this.Controls.Add(this.panel_softkey);
            this.Controls.Add(this.browserPanel);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.KeyPreview = true;
            this.MaximizeBox = false;
            this.Name = "SimForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "kaios模拟运行";
            this.browserPanel.ResumeLayout(false);
            this.browserPanel.PerformLayout();
            this.panel_softkey.ResumeLayout(false);
            this.menuStrip1.ResumeLayout(false);
            this.menuStrip1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox1)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Panel browserPanel;
        private System.Windows.Forms.Panel panel_softkey;
        private System.Windows.Forms.Button btn_leftsoft;
        private System.Windows.Forms.Button btn_rightsoft;
        private System.Windows.Forms.Button btn_ok;
        private System.Windows.Forms.Button btn_up;
        private System.Windows.Forms.Button btn_down;
        private System.Windows.Forms.Button btn_left;
        private System.Windows.Forms.Button btn_right;
        private System.Windows.Forms.Button btnsharp;
        private System.Windows.Forms.Button btn0;
        private System.Windows.Forms.Button btnstar;
        private System.Windows.Forms.Button btn9;
        private System.Windows.Forms.Button btn8;
        private System.Windows.Forms.Button btn7;
        private System.Windows.Forms.Button btn6;
        private System.Windows.Forms.Button btn5;
        private System.Windows.Forms.Button btn4;
        private System.Windows.Forms.Button btn3;
        private System.Windows.Forms.Button btn2;
        private System.Windows.Forms.Button btn1;
        private System.Windows.Forms.MenuStrip menuStrip1;
        private System.Windows.Forms.ToolStripMenuItem toolStripMenuItem1;
        private System.Windows.Forms.ToolStripMenuItem 刷新ToolStripMenuItem1;
        private System.Windows.Forms.ToolStripMenuItem 旋转屏幕ToolStripMenuItem1;
        private System.Windows.Forms.ToolStripMenuItem 切换分辨率ToolStripMenuItem1;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.PictureBox pictureBox1;
    }
}