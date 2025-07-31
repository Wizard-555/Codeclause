// script.js
const { jsPDF } = window.jspdf;

let currentTemplate = 'modern';

document.addEventListener('DOMContentLoaded', function () {
    initializeTabs();
    initializeTemplates();
    addInputListeners();
});

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function formatMonth(dateStr) {
    if (!dateStr) return '';
    const [year, month] = dateStr.split("-");
    return `${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} ${year}`;
}

function formatMonthDropdown(month, year) {
    if (!month || !year) return '';
    const monthIndex = parseInt(month, 10) - 1;
    const date = new Date(year, monthIndex);
    return date.toLocaleString('default', { month: 'short' }) + ' ' + year;
}



function getPersonalInfo() {
    return {
        fullName: document.getElementById('fullName').value.trim(),
        jobTitle: document.getElementById('jobTitle').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        location: document.getElementById('location').value.trim(),
        website: document.getElementById('website').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        github: document.getElementById('github').value.trim(),
        summary: document.getElementById('summary').value.trim()
    };
}

function updatePreview() {
    const preview = document.getElementById('resumePreview');
    const { fullName, jobTitle, email, phone, location, website, summary, linkedin, github } = getPersonalInfo();

    const experienceItems = Array.from(document.querySelectorAll('#experienceContainer .dynamic-item')).map(item => ({
        title: item.querySelector('.exp-title')?.value || '',
        company: item.querySelector('.exp-company')?.value || '',
        start: formatMonthDropdown(
            item.querySelector('.exp-start-month')?.value,
            item.querySelector('.exp-start-year')?.value
        ),
        end: formatMonthDropdown(
            item.querySelector('.exp-end-month')?.value,
            item.querySelector('.exp-end-year')?.value
        ),
        description: item.querySelector('.exp-description')?.value || ''
    }));
    

    const educationItems = Array.from(document.querySelectorAll('#educationContainer .dynamic-item')).map(item => ({
        degree: item.querySelector('.edu-degree')?.value || '',
        institution: item.querySelector('.edu-institution')?.value || '',
        year: item.querySelector('.edu-year')?.value || '',
        gpa: item.querySelector('.edu-gpa')?.value || ''
    }));

    const skillItems = Array.from(document.querySelectorAll('#skillsContainer .dynamic-item')).map(item => ({
        name: item.querySelector('.skill-name')?.value || '',
        level: item.querySelector('.skill-level')?.value || 0
    }));

    preview.innerHTML = `
        <div class="resume-header">
            <div class="resume-name">${fullName || 'Your Name'}</div>
            <div class="resume-title">${jobTitle || 'Job Title'}</div>
            <div class="resume-contact">
                ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${email}</div>` : ''}
                ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${phone}</div>` : ''}
                ${location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${location}</div>` : ''}
                ${website ? `<div class="contact-item"><i class="fas fa-globe"></i> <a href="${website}" target="_blank">${website}</a></div>` : ''}
                ${linkedin ? `<div class="contact-item"><i class="fab fa-linkedin"></i> <a href="${linkedin}" target="_blank">${linkedin}</a></div>` : ''}
                ${github ? `<div class="contact-item"><i class="fab fa-github"></i> <a href="${github}" target="_blank">${github}</a></div>` : ''}
            </div>
        </div>

        <div class="resume-body">
            ${summary ? `
                <div class="resume-section">
                    <h3><i class="fas fa-user"></i> Summary</h3>
                    <p class="item-description">${summary}</p>
                </div>` : ''}

            ${experienceItems.length ? `
                <div class="resume-section">
                    <h3><i class="fas fa-briefcase"></i> Experience</h3>
                    ${experienceItems.map(exp => `
                        <div class="resume-item">
                            <div class="item-header-resume">
                                <div>
                                    <div class="item-title-resume">${exp.title}</div>
                                    <div class="item-subtitle">${exp.company}</div>
                                </div>
                                <div class="item-date">${exp.start} - ${exp.end}</div>
                            </div>
                            <div class="item-description">${exp.description}</div>
                        </div>
                    `).join('')}
                </div>` : ''}

            ${educationItems.length ? `
                <div class="resume-section">
                    <h3><i class="fas fa-graduation-cap"></i> Education</h3>
                    ${educationItems.map(edu => `
                        <div class="resume-item">
                            <div class="item-header-resume">
                                <div>
                                    <div class="item-title-resume">${edu.degree}</div>
                                    <div class="item-subtitle">${edu.institution}</div>
                                </div>
                                <div class="item-date">${edu.year}</div>
                            </div>
                            <div class="item-description">GPA: ${edu.gpa}</div>
                        </div>
                    `).join('')}
                </div>` : ''}

            ${skillItems.length ? `
                <div class="resume-section">
                    <h3><i class="fas fa-cogs"></i> Skills</h3>
                    <div class="skills-grid">
                        ${skillItems.map(skill => `
                            <div class="skill-item">
                                <div class="skill-name">${skill.name}</div>
                                <div class="skill-level">
                                    <div class="skill-progress" style="width: ${skill.level}%;"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
        </div>
    `;
    
    applyTemplate();
}

function addInputListeners() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(updatePreview, 300));
        input.addEventListener('input', updateProgress);
    });

    // Email validation with inline error
    document.getElementById('email').addEventListener('blur', function () {
        const email = this.value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const parent = this.closest('.form-group');
        
        if (!emailRegex.test(email) && email) {
            parent.classList.add('error');
            this.classList.add('shake');
            setTimeout(() => this.classList.remove('shake'), 500);
            this.focus();
        } else {
            parent.classList.remove('error');
        }
    });

    // Phone validation with support for +91, 91, and 0 prefixes
    document.getElementById('phone').addEventListener('blur', function () {
        let phone = this.value.trim();
        // Remove any non-digit characters except '+'
        phone = phone.replace(/[^\d+]/g, '');
        
        // Phone regex that supports +91, 91, 0 prefixes
        const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
        const parent = this.closest('.form-group');
        
        if (!phoneRegex.test(phone) && phone) {
            parent.classList.add('error');
            this.classList.add('shake');
            setTimeout(() => this.classList.remove('shake'), 500);
            this.focus();
        } else {
            parent.classList.remove('error');
        }
    });
}

function updateProgress() {
    const filledInputs = Array.from(document.querySelectorAll('input, textarea')).filter(input => input.value.trim()).length;
    const totalInputs = document.querySelectorAll('input, textarea').length;
    const percent = Math.floor((filledInputs / totalInputs) * 100);
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressText').innerText = `${percent}%`;
}

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

function initializeTemplates() {
    const templates = document.querySelectorAll('.template-option');
    templates.forEach(template => {
        template.addEventListener('click', () => {
            templates.forEach(t => t.classList.remove('active'));
            template.classList.add('active');
            currentTemplate = template.dataset.template;
            applyTemplate();
            updatePreview();
        });
    });
}

function applyTemplate() {
    const preview = document.getElementById('resumePreview');
    preview.className = `resume-preview template-${currentTemplate}`;
}

function addExperience() {
    const container = document.getElementById('experienceContainer');

    const experienceItem = document.createElement('div');
    experienceItem.className = 'dynamic-item';

    // Basic structure
    experienceItem.innerHTML = `
        <div class="item-header">
            <div class="item-title">Experience</div>
            <button class="btn btn-danger" onclick="removeExperience(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="form-group">
            <label>Title</label>
            <input type="text" class="exp-title">
        </div>
        <div class="form-group">
            <label>Company</label>
            <input type="text" class="exp-company">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Start Month/Year</label>
                <div class="form-row">
                    <select class="exp-start-month"></select>
                    <select class="exp-start-year"></select>
                </div>
            </div>
            <div class="form-group">
                <label>End Month/Year</label>
                <div class="form-row">
                    <select class="exp-end-month"></select>
                    <select class="exp-end-year"></select>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="exp-description"></textarea>
        </div>
    `;

    // Fill dropdowns AFTER injecting HTML
    const startMonth = experienceItem.querySelector('.exp-start-month');
    const startYear = experienceItem.querySelector('.exp-start-year');
    const endMonth = experienceItem.querySelector('.exp-end-month');
    const endYear = experienceItem.querySelector('.exp-end-year');

    startMonth.innerHTML = generateMonthOptions();
    endMonth.innerHTML = generateMonthOptions();
    startYear.innerHTML = generateYearOptions();
    endYear.innerHTML = generateYearOptions();

    container.appendChild(experienceItem);
    addInputListeners();
    updatePreview();
}



function removeExperience(btn) {
    btn.closest('.dynamic-item').remove();
    updatePreview();
}

function addEducation() {
    const container = document.getElementById('educationContainer');
    const educationItem = document.createElement('div');
    educationItem.className = 'dynamic-item';
    educationItem.innerHTML = `
        <div class="item-header">
            <div class="item-title">Education</div>
            <button class="btn btn-danger" onclick="removeEducation(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="form-group">
            <label>Degree</label>
            <input type="text" class="edu-degree">
        </div>
        <div class="form-group">
            <label>Institution</label>
            <input type="text" class="edu-institution">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Year</label>
                <input type="text" class="edu-year" placeholder="e.g., 2018-2022">
            </div>
            <div class="form-group">
                <label>GPA</label>
                <input type="text" class="edu-gpa" placeholder="e.g., 3.8/4.0">
            </div>
        </div>
    `;
    container.appendChild(educationItem);
    addInputListeners();
    updatePreview();
}

function removeEducation(btn) {
    btn.closest('.dynamic-item').remove();
    updatePreview();
}

function addSkill() {
    const container = document.getElementById('skillsContainer');
    const skillItem = document.createElement('div');
    skillItem.className = 'dynamic-item';
    skillItem.innerHTML = `
        <div class="item-header">
            <div class="item-title">Skill</div>
            <button class="btn btn-danger" onclick="removeSkill(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="form-group">
            <label>Skill Name</label>
            <input type="text" class="skill-name">
        </div>
        <div class="form-group">
            <label>Proficiency (%)</label>
            <input type="range" class="skill-level" min="0" max="100" value="50">
            <div class="skill-value" style="text-align: center; margin-top: 5px;">50%</div>
        </div>
    `;
    
    const levelInput = skillItem.querySelector('.skill-level');
    const valueDisplay = skillItem.querySelector('.skill-value');
    levelInput.addEventListener('input', function() {
        valueDisplay.textContent = this.value + '%';
        updatePreview();
    });
    
    container.appendChild(skillItem);
    addInputListeners();
    updatePreview();
}

function removeSkill(btn) {
    btn.closest('.dynamic-item').remove();
    updatePreview();
}

function isValidForm() {
    let valid = true;
    
    // Validate email
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailGroup = document.getElementById('email').closest('.form-group');
    
    if (email && !emailRegex.test(email)) {
        emailGroup.classList.add('error');
        valid = false;
    } else {
        emailGroup.classList.remove('error');
    }
    
    // Validate phone
    let phone = document.getElementById('phone').value.trim();
    phone = phone.replace(/[^\d+]/g, '');
    const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
    const phoneGroup = document.getElementById('phone').closest('.form-group');
    
    if (phone && !phoneRegex.test(phone)) {
        phoneGroup.classList.add('error');
        valid = false;
    } else {
        phoneGroup.classList.remove('error');
    }
    
    return valid;
}

function downloadPDF() {
    if (!isValidForm()) {
        const firstError = document.querySelector('.form-group.error input');
        if (firstError) {
            firstError.focus();
            firstError.classList.add('shake');
            setTimeout(() => firstError.classList.remove('shake'), 500);
        }
        return;
    }

    const element = document.getElementById('resumePreview');

    html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff" // Set solid background
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = {
            width: canvas.width,
            height: canvas.height
        };
        const imgWidth = pageWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        let heightLeft = imgHeight - pageHeight;

        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('resume.pdf');
    });
}


function generateMonthOptions() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `<option value="">Month</option>` + 
        months.map((month, index) => `<option value="${index + 1}">${month}</option>`).join('');
}

function generateYearOptions(startYear = 1980, endYear = new Date().getFullYear() + 5) {
    let options = '<option value="">Year</option>';
    for (let year = endYear; year >= startYear; year--) {
        options += `<option value="${year}">${year}</option>`;
    }
    return options;
}
