namespace KaiosSim
{
    partial class SelectFBL
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
            this.radioButton320240 = new System.Windows.Forms.RadioButton();
            this.radioButton240320 = new System.Windows.Forms.RadioButton();
            this.radioButton360640 = new System.Windows.Forms.RadioButton();
            this.radioButton640360 = new System.Windows.Forms.RadioButton();
            this.radioButtoncustom = new System.Windows.Forms.RadioButton();
            this.textBox1 = new System.Windows.Forms.TextBox();
            this.button1 = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // radioButton320240
            // 
            this.radioButton320240.AutoSize = true;
            this.radioButton320240.Location = new System.Drawing.Point(139, 13);
            this.radioButton320240.Name = "radioButton320240";
            this.radioButton320240.Size = new System.Drawing.Size(65, 16);
            this.radioButton320240.TabIndex = 0;
            this.radioButton320240.TabStop = true;
            this.radioButton320240.Text = "320x240";
            this.radioButton320240.UseVisualStyleBackColor = true;
            // 
            // radioButton240320
            // 
            this.radioButton240320.AutoSize = true;
            this.radioButton240320.Location = new System.Drawing.Point(45, 13);
            this.radioButton240320.Name = "radioButton240320";
            this.radioButton240320.Size = new System.Drawing.Size(65, 16);
            this.radioButton240320.TabIndex = 0;
            this.radioButton240320.TabStop = true;
            this.radioButton240320.Text = "240x320";
            this.radioButton240320.UseVisualStyleBackColor = true;
            // 
            // radioButton360640
            // 
            this.radioButton360640.AutoSize = true;
            this.radioButton360640.Location = new System.Drawing.Point(45, 55);
            this.radioButton360640.Name = "radioButton360640";
            this.radioButton360640.Size = new System.Drawing.Size(65, 16);
            this.radioButton360640.TabIndex = 1;
            this.radioButton360640.TabStop = true;
            this.radioButton360640.Text = "360x640";
            this.radioButton360640.UseVisualStyleBackColor = true;
            // 
            // radioButton640360
            // 
            this.radioButton640360.AutoSize = true;
            this.radioButton640360.Location = new System.Drawing.Point(139, 55);
            this.radioButton640360.Name = "radioButton640360";
            this.radioButton640360.Size = new System.Drawing.Size(65, 16);
            this.radioButton640360.TabIndex = 2;
            this.radioButton640360.TabStop = true;
            this.radioButton640360.Text = "640x360";
            this.radioButton640360.UseVisualStyleBackColor = true;
            // 
            // radioButtoncustom
            // 
            this.radioButtoncustom.AutoSize = true;
            this.radioButtoncustom.Location = new System.Drawing.Point(45, 102);
            this.radioButtoncustom.Name = "radioButtoncustom";
            this.radioButtoncustom.Size = new System.Drawing.Size(59, 16);
            this.radioButtoncustom.TabIndex = 3;
            this.radioButtoncustom.TabStop = true;
            this.radioButtoncustom.Text = "自定义";
            this.radioButtoncustom.UseVisualStyleBackColor = true;
            // 
            // textBox1
            // 
            this.textBox1.Location = new System.Drawing.Point(139, 102);
            this.textBox1.Name = "textBox1";
            this.textBox1.Size = new System.Drawing.Size(65, 21);
            this.textBox1.TabIndex = 4;
            this.textBox1.Text = "320x480";
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(80, 147);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(90, 30);
            this.button1.TabIndex = 5;
            this.button1.Text = "确定";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // SelectFBL
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(250, 211);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.textBox1);
            this.Controls.Add(this.radioButtoncustom);
            this.Controls.Add(this.radioButton640360);
            this.Controls.Add(this.radioButton360640);
            this.Controls.Add(this.radioButton240320);
            this.Controls.Add(this.radioButton320240);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "SelectFBL";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "选择分辨率";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.RadioButton radioButton320240;
        private System.Windows.Forms.RadioButton radioButton240320;
        private System.Windows.Forms.RadioButton radioButton360640;
        private System.Windows.Forms.RadioButton radioButton640360;
        private System.Windows.Forms.RadioButton radioButtoncustom;
        private System.Windows.Forms.TextBox textBox1;
        private System.Windows.Forms.Button button1;
    }
}