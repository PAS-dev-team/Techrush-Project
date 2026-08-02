/* ==========================================================
        EVENTOS LOGIN PAGE
        Premium Interactions
========================================================== */


/* ---------------------------------------------------------
        PASSWORD TOGGLE
--------------------------------------------------------- */

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if(togglePassword){

    togglePassword.addEventListener("click",()=>{

        const type =
            passwordInput.getAttribute("type") === "password"
            ? "text"
            : "password";

        passwordInput.setAttribute("type",type);

        togglePassword.classList.toggle("fa-eye");
        togglePassword.classList.toggle("fa-eye-slash");

    });

}


/* ---------------------------------------------------------
        LOGIN CARD TILT EFFECT
--------------------------------------------------------- */

const loginCard = document.querySelector(".login-card");

if(loginCard){

loginCard.addEventListener("mousemove",(e)=>{

    const rect = loginCard.getBoundingClientRect();

    const x = e.clientX - rect.left;

    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width)-0.5)*10;

    const rotateX = ((rect.height/2 - y)/rect.height)*10;

    loginCard.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-6px)
    `;

});


loginCard.addEventListener("mouseleave",()=>{

    loginCard.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        translateY(0px)
    `;

});

}


/* ---------------------------------------------------------
        INPUT FOCUS EFFECT
--------------------------------------------------------- */

const inputs = document.querySelectorAll("input");

inputs.forEach((input)=>{

    input.addEventListener("focus",()=>{

        input.parentElement.style.transform="scale(1.02)";

    });

    input.addEventListener("blur",()=>{

        input.parentElement.style.transform="scale(1)";

    });

});


/* ---------------------------------------------------------
        HERO FADE-IN
--------------------------------------------------------- */

window.addEventListener("load",()=>{

    document.body.style.opacity="1";

});


/* ---------------------------------------------------------
        BUTTON RIPPLE EFFECT
--------------------------------------------------------- */

const buttons=document.querySelectorAll("button");

buttons.forEach(button=>{

button.addEventListener("click",function(e){

    const ripple=document.createElement("span");

    const rect=this.getBoundingClientRect();

    const size=Math.max(rect.width,rect.height);

    ripple.style.width=size+"px";
    ripple.style.height=size+"px";

    ripple.style.left=e.clientX-rect.left-size/2+"px";
    ripple.style.top=e.clientY-rect.top-size/2+"px";

    ripple.classList.add("ripple");

    this.appendChild(ripple);

    setTimeout(()=>{

        ripple.remove();

    },600);

});

});


/* ---------------------------------------------------------
        PARALLAX BACKGROUND
--------------------------------------------------------- */

const gradients=document.querySelectorAll(".gradient");

document.addEventListener("mousemove",(e)=>{

    const x=e.clientX/window.innerWidth;

    const y=e.clientY/window.innerHeight;

    gradients.forEach((gradient,index)=>{

        const speed=(index+1)*12;

        gradient.style.transform=`
        translate(
            ${(x-.5)*speed}px,
            ${(y-.5)*speed}px
        )`;

    });

});


/* ---------------------------------------------------------
        CARD SHADOW FOLLOW
--------------------------------------------------------- */

document.addEventListener("mousemove",(e)=>{

    if(!loginCard) return;

    const x=e.clientX/window.innerWidth;

    const y=e.clientY/window.innerHeight;

    loginCard.style.boxShadow=`
    ${-40+(x*80)}px
    ${30+(y*20)}px
    80px
    rgba(0,0,0,.45)
    `;

});


/* ---------------------------------------------------------
        LOGIN SUBMIT
--------------------------------------------------------- */

const form=document.querySelector("form");

if(form){

form.addEventListener("submit",async (e)=>{

    e.preventDefault();

    const email=document.getElementById("email").value.trim();
    const password=passwordInput ? passwordInput.value : "";

    const button=document.querySelector(".login-btn");

    button.innerHTML="Logging in...";
    button.disabled=true;

    try{

        const response=await fetch(`${API_URL}/api/auth/login`,{

            method:"POST",

            headers:{
                "Content-Type":"application/json",
            },

            body:JSON.stringify({email,password}),

        });

        const data=await response.json();

        if(!response.ok){

            throw new Error(Array.isArray(data?.error) ? data.error.map(e => e.message).join(", ") : (data?.message || "Login failed"));

        }

        localStorage.setItem("token", data?.data?.token || "");
        localStorage.setItem("user", JSON.stringify(data?.data?.user || {}));

        window.location.href="role-selection.html";

    }catch(err){

        alert(err.message||"Something went wrong.");

        button.innerHTML="Login";
        button.disabled=false;

    }

});

}