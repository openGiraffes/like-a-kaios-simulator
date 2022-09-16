using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace KaiosSim
{
    public partial class SelectFBL : Form
    {
        public SelectFBL(int width, int height)
        {
            InitializeComponent();

            if (width == 240 && height == 320)
            {
                radioButton240320.Checked = true;
            }
            else if (width == 320 && height == 240)
            {
                radioButton320240.Checked = true;
            }
            else if (width == 360 && height == 640)
            {
                radioButton360640.Checked = true;
            }
            else if (width == 640 && height == 360)
            {
                radioButton640360.Checked = true;
            }
            else {
                radioButtoncustom.Checked = true;
                textBox1.Text = width + "x" + height;
            }
        }
        public int outwidth = -1;
        public int outheight = -1;

        private void button1_Click(object sender, EventArgs e)
        {
            if(radioButtoncustom.Checked==false)
            {
                if(radioButton240320.Checked)
                {
                    outwidth = 240;
                    outheight = 320; 
                }
                else if (radioButton320240.Checked)
                {
                    outwidth = 320;
                    outheight = 240; 
                }
                else if (radioButton360640.Checked)
                {
                    outwidth = 360;
                    outheight = 640; 
                }
                else if (radioButton640360.Checked)
                {
                    outwidth = 640;
                    outheight = 360;
                }

                this.DialogResult = DialogResult.OK;
                this.Close();
            }
            else
            {
                string text = textBox1.Text;
                string[] sptext = text.ToLower().Split('x');
                if(sptext.Length!=2)
                {
                    MessageBox.Show("请输入正确的尺寸！");
                    return;
                }
                if (int.TryParse(sptext[0],out outwidth) == false)
                {
                    MessageBox.Show("请输入正确的宽度！");
                    return;
                }
                if(outwidth<50 || outwidth>800)
                {
                    MessageBox.Show("宽度只能是50到800之间的整数！");
                    return; 
                }
                if (int.TryParse(sptext[1], out outheight) == false)
                {
                    MessageBox.Show("请输入正确的高度！");
                    return;
                }
                if (outheight < 50 || outheight > 800)
                {
                    MessageBox.Show("高度只能是50到800之间的整数！");
                    return;
                }
                this.DialogResult = DialogResult.OK;
                this.Close();
            }
        }
    }
}
