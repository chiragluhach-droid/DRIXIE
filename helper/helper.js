const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const secretKey = process.env.SECRECTKKEYI;
const accessKeyIV = process.env.ACCESSKEYIV;
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const otpgnrt = require("otp-generator");
const nodemailer = require("nodemailer");
const otpmodel = require('../models/otpscheme');
class Helper {
    async sessiontoken() {
        try {
            const otpe = otpgnrt.generate(30, {
                digits: true,
                specialChars: true,
            });
            return otpe;
        } catch (err) {
            return null;
        }
    }
    async usertoken() {
        try {
            const otpe = otpgnrt.generate(20, {
                digits: true,
                specialChars: true,
            });
            return otpe;
        } catch (err) {
            return null;
        }
    }
    compunumber(dep, block, school) {
        //dep == catagory block = subcatagory 
        const depPart = dep.substring(0, 4).padEnd(4, 'X').toUpperCase().replace(/\s+/g, '');

        // Generate a random 4-digit number
        const randomPart = String(Math.floor(1000 + Math.random() * 9000));

        // Combine all parts
        let com = `MRUOSS${depPart}${block}${randomPart}`;;
        // if (school) {
        //   const sc = school.substring(0, 3).padEnd(3, 'X').toUpperCase().replace(/\s+/g, '');
        //   com = `MRU${depPart}${sc}${block}${randomPart}`
        // } else {
        //   com = `MRU${depPart}${block}${randomPart}`;
        // }
        return com;
    }
    // send mail
    async sendsinglemail(mail, subject, msg) {
        try {
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                // host: 'smtp.gmail.com',
                // port: 587,
                // secure: false,
                auth: {
                    user: process.env.GMAIL,
                    pass: process.env.GPASSWORD,
                },
            });

            await transporter.sendMail({
                from: `"myMR e-Office" <${process.env.GMAIL}>`,
                to: mail,
                subject: subject,
                text: msg,
                html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
  <!-- ✅ Main Message -->
  <p style="font-size: 15px; color: #333; text-align: left;">${msg}</p>

  <!-- ✅ Footer Section -->
  <div style="margin-top: 30px; border-top: 2px solid #e00; padding-top: 20px;">
    <table style="width: 100%; max-width: 600px;">
      <tr>
        <!-- Left Column -->
        <td style="width: 50%; text-align: left; vertical-align: top; padding-right: 10px;">
          <img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXfewiilmyPDKCDYnc0kYIfFvkunF3CoxtB3btBbyekVIsuWk6aUbH6wlKTCtTm4lGvVCXVsJoI292QUPvDAa1Nfq4rkLXznvVqpJJvgT1yQu-plhIChJeAUZZCru5O3At6i8q-o?key=bsGa7z40Vrkk5cEJsTJUUnBe" alt="Manav Rachna Logo" style="height: 60px;" />
          <div style="margin: 10px 0;">
            <strong><em>A QS I-Gauge Certified Institution of Happiness</em></strong>
          </div>
          <div>
            <a href="https://x.com/manav_rachna" style="margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="X" width="26" /></a>
            <a href="https://www.facebook.com/MRUFaridabad" style="margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="26" /></a>
            <a href="https://www.linkedin.com/school/manav-rachna-educational-institutions/" style="margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733561.png" alt="LinkedIn" width="26" /></a>
            <a href="https://www.instagram.com/manav_rachna/" style="margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" width="26" /></a>
            <a href="https://www.youtube.com/c/ManavRachnaEducationalInstitutions" style="margin: 0 5px;"><img src="https://cdn-icons-png.flaticon.com/512/733/733646.png" alt="YouTube" width="26" /></a>
          </div>
          <div style="margin-top: 10px;">
            <a href="https://manavrachna.edu.in" style="color: #1a73e8; text-decoration: none; font-weight: bold;">Manav Rachna University</a>
          </div>
        </td>

        <!-- Right Column -->
        <td style="width: 50%; text-align: left; vertical-align: top; padding-left: 16px; border-left: 2px solid #e53935;">
          <div style="font-family: 'Segoe UI', Roboto, sans-serif;">
            <h2 style="margin: 0; font-size: 20px; color: #b71c1c; letter-spacing: 0.5px;">
              <span style="color: #ce0707;">my</span><span style="color: #b71c1c;">MR</span> e-Office
            </h2>
            <p style="margin: 8px 0 0; font-size: 13.5px; color: #555; line-height: 1.5;">
              Embrace a digital future — <strong>Go Paperless</strong>, <strong>Transfer Fast</strong>, and <strong>Protect the Environment</strong>.
            </p>
          </div>
        </td>
      </tr>
    </table>
  </div>
</div>

  `});

            return true;
        } catch (err) {
            console.log(err)
            return false;
        }
    }
    // 
      async sendingotp(userid, purpose) {
    try {
      const otp = otpgnrt.generate(6, {
        digits: true,
        specialChars: false,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false
      });
      const sendotp = await otpmodel.create({
        userId: userid,
        otp: otp,
        purpose: purpose,
        status: 0
      });
      if (!sendotp) return null;
      return otp;
    } catch (err) {
      console.log(err)
      return null;
    }
  }
  async validateotp(userid, purpose, otp) {
    try {
      let sendotp = await otpmodel.findOne({
        where: {
          userId: userid,
          otp: otp,
          purpose: purpose,
          status: 0
        }
      });
      if (!sendotp) return false;
      const now = new Date();
      const otpTime = new Date(sendotp.time); // assuming `time` is a Date type column
      const diffInMinutes = (now - otpTime) / (1000 * 60);

      if (diffInMinutes > 5) {
        await sendotp.update(
          {
            status: 1,
            otp: otpgnrt.generate(10, {
              digits: true,
              specialChars: true
            })
          },
          { where: { id: sendotp.id } }
        )
        return false;
      }
      await sendotp.update(
        {
          status: 1,
          otp: otpgnrt.generate(10, {
            digits: true,
            specialChars: true
          })
        },
        { where: { id: sendotp.id } }
      )
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  // encrypt decrypt
  // decrypt encrypt
  async balencrypt(bal) {
  try {
    if (!bal || typeof bal !== "string") {
      throw new Error("balencrypt: input is missing or not a string");
    }

    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(secretKey),
      Buffer.from(accessKeyIV)
    );

    let encrypted = cipher.update(bal, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;

  } catch (err) {
    console.error("Encryption error:", err.message);
    throw err; // rethrow so caller knows it failed
  }
}

  async baldecryptt(bal) {
    try {
      const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(secretKey),
        Buffer.from(accessKeyIV)
      );
      let decrypted = decipher.update(bal, "base64", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (err) {
      return null;
    }
  }
}
module.exports = new Helper();