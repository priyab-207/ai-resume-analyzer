// Global State
let currentResumes = JSON.parse(localStorage.getItem('myResumes')) || [];
const userProfile = JSON.parse(localStorage.getItem('resumeProfile')) || {};

// DOM Elements
const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const tabLinks = document.querySelectorAll('.nav-item');
const spaTabs = document.querySelectorAll('.spa-tab');

// -----------------------------------------
// 1. Core Layout & Navigation
// -----------------------------------------

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const isLight = body.getAttribute('data-theme') === 'light';
    if (isLight) {
        body.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fa-regular fa-moon"></i>';
    } else {
        body.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fa-regular fa-sun"></i>';
    }
});

// SPA Router
tabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        tabLinks.forEach(l => l.classList.remove('active'));
        // Add to clicked
        link.classList.add('active');
        
        // Hide all tabs
        spaTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.classList.add('hidden');
        });
        
        // Show target tab
        const targetId = link.getAttribute('data-target');
        const targetTab = document.getElementById(targetId);
        targetTab.classList.remove('hidden');
        
        // Force reflow to trigger animation
        void targetTab.offsetWidth; 
        targetTab.classList.add('active');

        // Specific actions on tab open
        if(targetId === 'my-resumes-tab') {
            renderMyResumes();
        }
    });
});

// "New Scan" buttons across the app
document.querySelectorAll('.new-scan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Switch to dashboard tab
        document.querySelector('.nav-item[data-target="dashboard-tab"]').click();
        resetAnalyzer();
    });
});


// -----------------------------------------
// 2. DASHBOARD (Analyzer Engine)
// -----------------------------------------
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadView = document.getElementById('upload-view');
const analyzingView = document.getElementById('analyzing-view');
const resultsView = document.getElementById('results-view');
const analyzedFilename = document.getElementById('analyzed-filename');

// Drag & Drop
if(dropZone) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });
}

function handleFile(file) {
    analyzedFilename.textContent = file.name;
    
    // UI Transition
    uploadView.classList.add('hidden');
    uploadView.classList.remove('active');
    analyzingView.classList.remove('hidden');
    analyzingView.classList.add('active');

    // Simulate AI Pipeline
    simulateAnalysisPipeline(file);
}

function resetAnalyzer() {
    resultsView.classList.add('hidden');
    resultsView.classList.remove('active');
    uploadView.classList.remove('hidden');
    uploadView.classList.add('active');
    fileInput.value = '';
    
    // Reset steps
    document.querySelectorAll('.step').forEach(step => {
        step.className = 'step pending';
        step.innerHTML = `<div class="step-icon"></div> ${step.textContent.trim()}`;
    });
}

function simulateAnalysisPipeline(file) {
    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-4')
    ];

    let currentStep = 0;

    function nextStep() {
        if (currentStep > 0) {
            const prevStep = steps[currentStep - 1];
            prevStep.className = 'step done';
            prevStep.innerHTML = `<i class="fa-solid fa-check" style="color:var(--accent-4); margin-right:16px;"></i> ${prevStep.textContent.trim()}`;
        }

        if (currentStep < steps.length) {
            steps[currentStep].className = 'step active';
            const delay = Math.random() * 1000 + 1000; 
            currentStep++;
            setTimeout(nextStep, delay);
        } else {
            setTimeout(() => showResults(file.name), 500);
        }
    }

    nextStep();
}

function showResults(filename) {
    analyzingView.classList.add('hidden');
    analyzingView.classList.remove('active');
    resultsView.classList.remove('hidden');
    
    // Force reflow
    void resultsView.offsetWidth;
    resultsView.classList.add('active');

    // Generate Scores
    const baseScore = Math.floor(Math.random() * 30) + 65; // 65-95
    document.getElementById('overall-score-text').textContent = "0";

    // Set metrics
    const iScore = Math.min(10, Math.floor((baseScore / 100) * 10) + (Math.random() > 0.5 ? 1 : 0));
    const bScore = Math.max(5, Math.floor(Math.random() * 5) + 5);
    const sScore = Math.max(6, Math.floor(Math.random() * 5) + 5);
    const secScore = 10;
    
    document.getElementById('impact-score').textContent = `${iScore}/10`;
    document.getElementById('brevity-score').textContent = `${bScore}/10`;
    document.getElementById('style-score').textContent = `${sScore}/10`;
    document.getElementById('section-score').textContent = `${secScore}/10`;

    // Animations
    setTimeout(() => {
        document.getElementById('overall-progress').style.background = `conic-gradient(var(--accent-4) ${baseScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`;
        animateNumber('overall-score-text', 0, baseScore, 1500);
        
        document.getElementById('impact-bar').style.width = `${iScore * 10}%`;
        document.getElementById('brevity-bar').style.width = `${bScore * 10}%`;
        document.getElementById('style-bar').style.width = `${sScore * 10}%`;
        document.getElementById('section-bar').style.width = `${secScore * 10}%`;

    }, 300);

    // Set Status
    const statusEl = document.getElementById('score-status');
    if(baseScore > 85) { statusEl.textContent = "Excellent"; statusEl.style.color = "var(--accent-4)"; }
    else if(baseScore > 75) { statusEl.textContent = "Good"; statusEl.style.color = "var(--accent-1)"; }
    else { statusEl.textContent = "Needs Improvement"; statusEl.style.color = "var(--accent-2)"; }

    generateFeedback(baseScore);
    saveResumeToStorage(filename, baseScore);
}

function animateNumber(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function generateFeedback(score) {
    const list = document.getElementById('feedback-list');
    list.innerHTML = `
        <div class="feedback-item type-critical">
            <i class="fa-solid fa-triangle-exclamation feedback-icon"></i>
            <div class="feedback-content">
                <h4>Quantify your achievements</h4>
                <p>We found 4 bullet points that lack numbers or metrics. E.g. "Improved performance" -> "Improved performance by 25%".</p>
                <div class="ai-suggestion">AI Suggestion: Use the formula: Accomplished [X] as measured by [Y], by doing [Z].</div>
            </div>
        </div>
        <div class="feedback-item type-warning">
            <i class="fa-solid fa-circle-exclamation feedback-icon"></i>
            <div class="feedback-content">
                <h4>Missing strong action verbs</h4>
                <p>You used weak verbs like "Helped" and "Worked". Replace them with "Spearheaded", "Architected", or "Facilitated".</p>
            </div>
        </div>
        <div class="feedback-item type-good">
            <i class="fa-solid fa-circle-check feedback-icon"></i>
            <div class="feedback-content">
                <h4>Good ATS specific formatting</h4>
                <p>Your document structure is easily readable by standard applicant tracking systems. No complex tables or dual columns detected.</p>
            </div>
        </div>
    `;
}

// -----------------------------------------
// 3. MY RESUMES (Storage & Vault)
// -----------------------------------------

function saveResumeToStorage(filename, score) {
    const newResume = {
        name: filename,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        score: score,
        id: Date.now()
    };
    currentResumes.unshift(newResume);
    localStorage.setItem('myResumes', JSON.stringify(currentResumes));
}

function renderMyResumes() {
    const container = document.getElementById('resumes-container');
    container.innerHTML = '';

    if (currentResumes.length === 0) {
        container.innerHTML = `<div class="p-16 text-center text-light" style="grid-column: 1 / -1;">
            <i class="fa-solid fa-folder-open mb-16" style="font-size: 40px; opacity: 0.3;"></i>
            <p>Your vault is empty. Upload a resume to get started!</p>
        </div>`;
        return;
    }

    currentResumes.forEach((res, index) => {
        const card = document.createElement('div');
        card.className = 'resume-card';
        card.innerHTML = `
            <div class="resume-card-header">
                <i class="fa-solid fa-file-pdf resume-icon"></i>
                <div class="resume-score">
                    <i class="fa-solid fa-bolt"></i> ${res.score}%
                </div>
            </div>
            <h3>${res.name}</h3>
            <p>Analyzed on ${res.date}</p>
            <div class="resume-card-actions">
                <button class="btn-view" onclick="viewResume(${index})"><i class="fa-regular fa-eye"></i> View Report</button>
                <button class="btn-icon-text" onclick="deleteResumeModal(${index})" style="color:var(--danger); margin-left:auto;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function viewResume(index) {
    // Just switch to dashboard and simulate results
    const doc = currentResumes[index];
    document.querySelector('.nav-item[data-target="dashboard-tab"]').click();
    showResults(doc.name);
    // Hardcode score for viewing so it matches
    setTimeout(() => {
        document.getElementById('overall-score-text').textContent = doc.score;
        document.getElementById('overall-progress').style.background = `conic-gradient(var(--accent-4) ${doc.score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`;
    }, 100);
}

// Custom Premium Modal for Deletion
const modalOverlay = document.getElementById('global-modal');
const modalContent = document.getElementById('modal-content-area');

function deleteResumeModal(index) {
    modalContent.innerHTML = `
        <button class="close-modal" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div style="text-align:center; padding: 20px 0;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); display: flex; align-items:center; justify-content:center; color: var(--danger); font-size: 32px; margin: 0 auto 24px auto;">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2 style="margin-bottom: 12px;">Delete Report?</h2>
            <p class="text-light" style="margin-bottom: 32px;">Are you sure you want to permanently delete this resume analysis? This action cannot be undone.</p>
            <div style="display:flex; gap: 16px; justify-content:center;">
                <button class="btn-outline rounded-btn" onclick="closeModal()">Cancel</button>
                <button class="btn-primary rounded-btn" style="background:var(--danger); box-shadow:none;" onclick="confirmDelete(${index})">Delete Now</button>
            </div>
        </div>
    `;
    modalOverlay.classList.remove('hidden');
}

function confirmDelete(index) {
    currentResumes.splice(index, 1);
    localStorage.setItem('myResumes', JSON.stringify(currentResumes));
    closeModal();
    renderMyResumes();
}

function closeModal() {
    modalOverlay.classList.add('hidden');
}

function openUpgradeModal() {
    modalContent.innerHTML = `
        <button class="close-modal" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
        <div style="text-align:center; padding: 10px 0;">
            <div style="width: 60px; height: 60px; border-radius: 16px; background: var(--gradient-brand); display: flex; align-items:center; justify-content:center; color: white; font-size: 28px; margin: 0 auto 20px auto; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4);">
                <i class="fa-solid fa-crown"></i>
            </div>
            <h2 style="margin-bottom: 8px;">Upgrade to Pro</h2>
            <p class="text-light" style="margin-bottom: 32px;">Unlock the full power of AI to land your dream job faster.</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left;">
                <!-- Free Plan -->
                <div style="border: 1px solid var(--border-light); border-radius: 16px; padding: 24px; background: rgba(0,0,0,0.2);">
                    <h3 style="margin-bottom: 8px;">Basic</h3>
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">$0<span style="font-size:14px; color:var(--text-light); font-weight:400;">/mo</span></div>
                    <ul style="list-style:none; margin-bottom: 24px; display:flex; flex-direction:column; gap:12px; font-size:14px; color:var(--text-light);">
                        <li><i class="fa-solid fa-check text-accent-4" style="margin-right:8px;"></i> 2 Resume Scans / week</li>
                        <li><i class="fa-solid fa-check text-accent-4" style="margin-right:8px;"></i> Basic formatting tips</li>
                        <li><i class="fa-solid fa-xmark" style="color:var(--danger); margin-right:8px;"></i> No Cover Letters</li>
                    </ul>
                    <button class="btn-outline rounded-btn w-100" style="cursor:not-allowed; opacity:0.5;" disabled>Current Plan</button>
                </div>

                <!-- Pro Plan -->
                <div style="border: 2px solid var(--accent-primary); border-radius: 16px; padding: 24px; background: rgba(59, 130, 246, 0.05); position:relative; overflow:hidden;">
                    <div style="position:absolute; top:20px; right:-30px; background:var(--gradient-brand); color:white; font-size:10px; font-weight:700; padding:6px 40px; transform:rotate(45deg); text-transform:uppercase; letter-spacing:1px; box-shadow:0 4px 10px rgba(0,0,0,0.2);">Popular</div>
                    <h3 style="margin-bottom: 8px; color: var(--accent-primary);">Pro</h3>
                    <div style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">$15<span style="font-size:14px; color:var(--text-light); font-weight:400;">/mo</span></div>
                    <ul style="list-style:none; margin-bottom: 24px; display:flex; flex-direction:column; gap:12px; font-size:14px;">
                        <li><i class="fa-solid fa-check text-accent-4" style="margin-right:8px;"></i> <strong>Unlimited</strong> Scans</li>
                        <li><i class="fa-solid fa-check text-accent-4" style="margin-right:8px;"></i> Advanced AI Insights</li>
                        <li><i class="fa-solid fa-check text-accent-4" style="margin-right:8px;"></i> Unlimited Cover Letters</li>
                    </ul>
                    <button class="btn-primary rounded-btn w-100" onclick="alert('Proceed to Stripe Checkout!')">Upgrade Now</button>
                </div>
            </div>
        </div>
    `;
    modalOverlay.classList.remove('hidden');
}



// -----------------------------------------
// 4. COVER LETTER GENERATOR (AI Typing Sim)
// -----------------------------------------
const clGenerateBtn = document.getElementById('cl-generate-btn');
const clTitle = document.getElementById('cl-title');
const clCompany = document.getElementById('cl-company');
const clEditor = document.getElementById('cl-editor');
const clCopyBtn = document.getElementById('cl-copy');

let isTyping = false;

clGenerateBtn.addEventListener('click', () => {
    if (isTyping) return;
    
    const title = clTitle.value.trim() || 'Software Professional';
    const company = clCompany.value.trim() || 'your esteemed company';
    
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const name = userProfile.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}` : '[Your Name]';
    
    const draft = `
${date}

Hiring Manager
${company}

Dear Hiring Team,

I am writing to express my strong interest in the ${title} position at ${company}. With a proven track record of delivering high-quality results and a deep passion for innovation within the tech industry, I am confident in my ability to make an immediate impact on your team.

In my previous roles, I successfully spearheaded projects that increased overall team productivity by 25% and directly contributed to product growth. I am particularly drawn to ${company} because of your commitment to excellence and forward-thinking approach. My background in crafting robust solutions aligns perfectly with your goals.

I thrive in collaborative environments and am eager to bring my expertise in problem-solving, strategic planning, and cross-functional leadership to ${company}. I am certain that my unique blend of experience and dedication makes me a strong fit for this opportunity.

Thank you for considering my application. I have attached my resume for your review and look forward to the possibility of discussing how my skills align with your needs.

Sincerely,

${name}
    `.trim();

    // Prepare typing
    clEditor.innerHTML = '';
    clEditor.classList.add('typing-cursor');
    isTyping = true;
    clGenerateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    clGenerateBtn.style.opacity = '0.7';

    let i = 0;
    // Typing speed ~ 10-20ms per char
    function typeWriter() {
        if (i < draft.length) {
            clEditor.innerHTML += draft.charAt(i) === '\n' ? '<br>' : draft.charAt(i);
            i++;
            // Scroll to bottom optionally manually: clEditor.scrollTop = clEditor.scrollHeight;
            setTimeout(typeWriter, 15);
        } else {
            clEditor.classList.remove('typing-cursor');
            isTyping = false;
            clGenerateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Draft Cover Letter';
            clGenerateBtn.style.opacity = '1';
            clCopyBtn.removeAttribute('disabled');
        }
    }
    
    // Simulate initial AI API delay
    setTimeout(typeWriter, 800);
});

clCopyBtn.addEventListener('click', () => {
    // Only copy the text, replacing <br> with newlines
    let text = clEditor.innerText;
    navigator.clipboard.writeText(text).then(() => {
        clCopyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        setTimeout(() => {
            clCopyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
        }, 2000);
    });
});

// -----------------------------------------
// 5. SETTINGS FORM & PROFILE INIT
// -----------------------------------------

function initProfile() {
    // defaults
    if(!userProfile.firstName) userProfile.firstName = 'User';
    if(!userProfile.lastName) userProfile.lastName = '';
    if(!userProfile.bgColor) userProfile.bgColor = '0D8ABC';

    const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=${userProfile.bgColor}&color=fff`;

    // 1. Update all general avatars
    document.querySelectorAll('.avatar img').forEach(img => {
        if(img.id !== 'settings-avatar-preview') {
            img.src = avatarUrl;
        }
    });

    // 2. Update sidebar name
    const sidebarName = document.querySelector('.user-info strong');
    if (sidebarName) sidebarName.textContent = userProfile.firstName;

    // 3. Update welcome banner
    const welcomeH1 = document.querySelector('#upload-view .welcome-banner h1');
    if (welcomeH1) welcomeH1.innerHTML = `Welcome back, ${userProfile.firstName}! 👋`;

    // 4. Update settings form inputs
    const fnameInput = document.getElementById('set-fname');
    if (fnameInput) fnameInput.value = userProfile.firstName;
    
    const lnameInput = document.getElementById('set-lname');
    if (lnameInput) lnameInput.value = userProfile.lastName;
    
    const bgInput = document.getElementById('set-bgColor');
    if (bgInput) bgInput.value = userProfile.bgColor;

    // 5. Update settings preview
    updateSettingsPreview();
}

function updateSettingsPreview() {
    const f = document.getElementById('set-fname')?.value.trim() || 'User';
    const l = document.getElementById('set-lname')?.value.trim() || '';
    let b = document.getElementById('set-bgColor')?.value.trim().replace('#', '') || '0D8ABC';
    
    const fullName = `${f} ${l}`.trim();
    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=${b}&color=fff`;
    
    const previewImg = document.getElementById('settings-avatar-preview');
    if(previewImg) previewImg.src = url;
    
    const previewName = document.getElementById('settings-name-preview');
    if(previewName) previewName.textContent = fullName;
}

// Attach Live Preview events
['set-fname', 'set-lname', 'set-bgColor'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', updateSettingsPreview);
});

// Save Profile Event
const saveProfileBtn = document.getElementById('save-profile-btn');
if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
        const fname = document.getElementById('set-fname').value.trim() || 'User';
        const lname = document.getElementById('set-lname').value.trim();
        let bg = document.getElementById('set-bgColor').value.trim().replace('#', '');
        if(!bg) bg = '0D8ABC';

        userProfile.firstName = fname;
        userProfile.lastName = lname;
        userProfile.bgColor = bg;

        localStorage.setItem('resumeProfile', JSON.stringify(userProfile));
        initProfile();
        
        saveProfileBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        setTimeout(() => {
            saveProfileBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
        }, 2000);
    });
}

// Hydrate UI on page load
document.addEventListener('DOMContentLoaded', initProfile);

// -----------------------------------------
// 6. LINKEDIN PROFILER SIMULATION
// -----------------------------------------
const liBtn = document.getElementById('li-btn');
if (liBtn) {
    liBtn.addEventListener('click', () => {
        const url = document.getElementById('li-url').value.trim();
        const industry = document.getElementById('li-industry').value.trim() || 'Tech';
        
        if (!url) {
            alert('Please enter a LinkedIn Profile URL to analyze');
            return;
        }

        const outContainer = document.getElementById('li-output');
        const emptyState = document.getElementById('li-empty-state');
        
        // Loader State
        if (emptyState) emptyState.style.display = 'none';
        
        outContainer.innerHTML = `
            <div class="flex-center" style="height:100%; flex-direction:column;">
                <i class="fa-solid fa-spinner fa-spin text-accent-1" style="font-size:40px; margin-bottom:16px;"></i>
                <p class="text-light">Scanning ${industry} keywords and evaluating headline...</p>
            </div>
        `;
        
        liBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
        liBtn.style.opacity = '0.7';

        setTimeout(() => {
            const fName = userProfile.firstName || 'User';
            const lName = userProfile.lastName || '';
            const score = Math.floor(Math.random() * 20) + 70; // 70-90 score
            
            outContainer.innerHTML = `
                <div style="width:100%; padding: 20px 0;">
                    <div class="flex-between mb-24" style="border-bottom: 1px solid var(--border-light); padding-bottom: 20px;">
                        <div style="display:flex; align-items:center; gap: 16px;">
                            <div class="avatar" style="width:60px; height:60px;">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(fName+' '+lName)}&background=${userProfile.bgColor || '0D8ABC'}&color=fff" style="border-radius:50%; width:100%;">
                            </div>
                            <div>
                                <h3 style="margin-bottom:4px;">${fName} ${lName}</h3>
                                <p class="text-light" style="font-size:13px;">Profile properly matched to ${industry} trends.</p>
                            </div>
                        </div>
                        <div class="score-pill" style="font-size:24px; padding: 12px 20px;">
                            ${score}/100
                        </div>
                    </div>
                    
                    <h4 style="margin-bottom:16px;"><i class="fa-solid fa-robot"></i> Profile Insights</h4>
                    <div class="feedback-list">
                        <div class="feedback-item type-good">
                            <i class="fa-solid fa-circle-check feedback-icon"></i>
                            <div class="feedback-content">
                                <h4>Headline Impact</h4>
                                <p>Your headline effectively uses relevant ${industry} keywords, making you 3x more likely to appear in recruiter searches.</p>
                            </div>
                        </div>
                        <div class="feedback-item type-warning">
                            <i class="fa-solid fa-circle-exclamation feedback-icon"></i>
                            <div class="feedback-content">
                                <h4>About Summary Length</h4>
                                <p>Your summary is slightly shorter than the recommended 200-300 words for the ${industry} sector. Consider adding a short paragraph about your core philosophy.</p>
                            </div>
                        </div>
                        <div class="feedback-item type-critical">
                            <i class="fa-solid fa-triangle-exclamation feedback-icon"></i>
                            <div class="feedback-content">
                                <h4>Missing Featured Section</h4>
                                <p>You haven't pinned any links, articles, or portfolios to your 'Featured' section. This significantly lowers engagement on your profile.</p>
                                <div class="ai-suggestion">AI Suggestion: Pin your top 2 projects or a link to your online portfolio here.</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            liBtn.innerHTML = '<i class="fa-brands fa-linkedin"></i> Analyze Profile';
            liBtn.style.opacity = '1';
            
        }, 1500);
    });
}
