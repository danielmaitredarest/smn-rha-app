// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
// Tab navigation
document.addEventListener('DOMContentLoaded', function() {
    // Tab navigation
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Update active tab
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show the corresponding tab content
            const targetTab = this.getAttribute('data-tab');
            tabContents.forEach(tab => {
                tab.style.display = tab.id === targetTab ? 'block' : 'none';
            });
        });
    });
});
    
    // ---- APP 1: JOB GENERATOR ----
    setupJobGenerator();
    
    // ---- APP 2: CV ANALYZER ----
    setupCVAnalyzer();
    
    // ---- APP 3: INTERVIEW QUESTIONS ----
    setupInterviewQuestions();
    
    // ---- APP 4: ANSWER EVALUATOR ----
    setupAnswerEvaluator();
    
    // ---- APP 5: ONBOARDING ----
    setupOnboarding();
});

// Global variables
let openAIKey = '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';
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Modifiez la fonction callOpenAI dans app.js
async function callOpenAI(prompt, model = 'gpt-4o') {
    try {
        console.log("Envoi de la requête à Make.com avec prompt:", prompt);
        
        // URL de votre webhook Make.com
        const makeWebhookUrl = 'https://hook.eu2.make.com/dyx7p6mu5rm9n1dumi9proom9bfvohh4';
        
        // Corps de la requête
        const requestBody = {
            prompt: prompt,
            model: model  // Incluez le modèle également
        };
        
        console.log("Corps de la requête:", JSON.stringify(requestBody));
        
        // Envoi de la requête
        const response = await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log("Statut de la réponse:", response.status);
        
        // Si la réponse n'est pas un succès
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur de réponse:", errorText);
            throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
        }
        
        // Récupération de la réponse
        const data = await response.json();
        console.log("Réponse reçue:", data);
        
        return data;
    } catch (error) {
        console.error('Erreur complète:', error);
        alert(`Erreur lors de l'appel au service IA: ${error.message}`);
        return null;
    }
}

// ---- APP 1: JOB GENERATOR ----
function setupJobGenerator() {
// Trouvez cette partie dans app.js (fonction setupJobGenerator ou gestionnaire d'événements du formulaire)
document.getElementById('job-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Ajout de logs pour débugger
    console.log("Formulaire soumis");
    
    const generateBtn = document.getElementById('generate-job-btn');
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Génération en cours...';
    
    // Get form values
    const title = document.getElementById('job-title').value;
    const department = document.getElementById('job-department').value;
    const location = document.getElementById('job-location').value;
    const activityRate = document.getElementById('job-activity-rate').value;
    const contractType = document.getElementById('job-contract-type').value;
    const duration = document.getElementById('job-duration').value;
    const startDate = document.getElementById('job-start-date').value;
    const publishDate = document.getElementById('job-publish-date').value;
    const description = document.getElementById('job-description').value;
    const missions = document.getElementById('job-missions').value;
    
    console.log("Données du formulaire:", { title, department, location });
    
    // Create prompt (avec ou sans OpenAI key selon votre configuration actuelle)
    const prompt = `Tu es un recruteur expert dans le domaine médical.

À partir des informations ci-dessous, génère une **offre d'emploi professionnelle**, complète et engageante.

- Poste : ${title}
- Département / Service : ${department}
- Lieu : ${location}
- Taux d'activité : ${activityRate} %
- Type de contrat : ${contractType}
- Durée (si CDD) : ${duration || 'N/A'}
- Date de début souhaitée : ${startDate}
- Date de publication : ${publishDate}
- Description générale : ${description}
- Missions principales : ${missions}

Structure la réponse ainsi :
1. Titre (poste + lieu)
2. Introduction
3. Missions (liste à puces)
4. Profil recherché
5. Avantages ou spécificités de l'établissement
6. Contact RH

À la fin, ajoute un **résumé pour LinkedIn (max 300 caractères)**.`;

    console.log("Prompt préparé, appel à callOpenAI");
    
    // Call OpenAI API via notre fonction modifiée
    try {
        const generatedContent = await callOpenAI(prompt);
        console.log("Réponse reçue de callOpenAI:", generatedContent);
        
        if (generatedContent) {
            // Extract LinkedIn summary
            const parts = generatedContent.split('résumé pour LinkedIn', 2);
            
            let jobDescription = parts[0];
            let linkedinSummary = '';
            
            if (parts.length > 1) {
                linkedinSummary = parts[1].replace(/^\s*[:(-]\s*/, '').trim();
                jobDescription = jobDescription.trim();
            }
            
            // Display results
            document.getElementById('job-result').innerHTML = formatText(jobDescription);
            document.getElementById('linkedin-summary').innerHTML = formatText(linkedinSummary);
            
            // Enable buttons
            document.getElementById('copy-job-btn').disabled = false;
            document.getElementById('save-job-btn').disabled = false;
            
            // Save job to Firestore
            saveJobToFirestore({
                title,
                department,
                location,
                activityRate,
                contractType,
                duration: duration || 'N/A',
                startDate,
                publishDate,
                description,
                missions,
                generatedJob: jobDescription,
                linkedinSummary
            });
        } else {
            console.error("Pas de contenu généré reçu");
            alert("Erreur lors de la génération de l'offre d'emploi. Veuillez réessayer.");
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à callOpenAI:", error);
        alert("Erreur lors de la génération de l'offre d'emploi: " + error.message);
    } finally {
        // Reset button
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Générer l\'offre d\'emploi';
    }
});

// Utility function to format text with HTML
function formatText(text) {
    if (!text) return '';
    
    // Replace bullet points
    text = text.replace(/^[-*]\s+/gm, '<li>').replace(/\n[-*]\s+/g, '</li><li>');
    if (text.includes('<li>')) {
        text = text.replace(/<li>/, '<ul><li>') + '</li></ul>';
    }
    
    // Replace headers
    text = text.replace(/^#{1,6}\s+(.+)$/gm, (match, p1) => `<h${match.trim().split(' ')[0].length}>${p1}</h${match.trim().split(' ')[0].length}>`);
    
    // Replace newlines with paragraphs
    text = text.split('\n\n').map(para => para.trim() ? `<p>${para}</p>` : '').join('');
    
    // Replace single newlines
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// ---- APP 2: CV ANALYZER ----
function setupCVAnalyzer() {
    // Job selection change
    document.getElementById('job-select').addEventListener('change', async function() {
        const jobId = this.value;
        if (!jobId) {
            document.getElementById('selected-job-details').innerHTML = '<p class="text-muted text-center">Sélectionnez une offre d\'emploi pour voir les détails.</p>';
            return;
        }
        
        try {
            const { doc, getDoc } = window.firebaseModules;
            const db = window.db;
            
            // Get job from Firestore
            const jobDoc = await getDoc(doc(db, 'jobs', jobId));
            if (jobDoc.exists()) {
                const job = jobDoc.data();
                document.getElementById('selected-job-details').innerHTML = `
                    <h6>${job.title}</h6>
                    <p><strong>Lieu:</strong> ${job.location}</p>
                    <p><strong>Département:</strong> ${job.department}</p>
                    <p><strong>Description:</strong> ${job.description}</p>
                    <p><strong>Missions:</strong> ${job.missions}</p>
                `;
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
        }
        
        // Enable analyze button if CV(s) are uploaded
        checkAnalyzeButtonState();
    });
    
    // CV upload
    document.getElementById('cv-upload').addEventListener('change', function(e) {
        const files = e.target.files;
        const uploadList = document.getElementById('upload-list');
        uploadList.innerHTML = '';
        
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                const item = document.createElement('div');
                item.className = 'alert alert-secondary d-flex justify-content-between align-items-center';
                item.innerHTML = `
                    <div>
                        <i class="fas fa-file-pdf me-2"></i>
                        ${file.name}
                    </div>
                    <span class="badge bg-primary">${(file.size / 1024).toFixed(1)} KB</span>
                `;
                uploadList.appendChild(item);
            });
        } else {
            uploadList.innerHTML = '<p class="text-muted">Aucun fichier sélectionné</p>';
        }
        
        // Enable analyze button if job is selected
        checkAnalyzeButtonState();
    });
    
    // Check if analyze button should be enabled
    function checkAnalyzeButtonState() {
        const jobSelect = document.getElementById('job-select');
        const cvUpload = document.getElementById('cv-upload');
        const analyzeBtn = document.getElementById('analyze-cvs-btn');
        
        analyzeBtn.disabled = !(jobSelect.value && cvUpload.files.length > 0);
    }
    
    // Analyze CVs button
    document.getElementById('analyze-cvs-btn').addEventListener('click', async function() {
        const jobId = document.getElementById('job-select').value;
        const files = document.getElementById('cv-upload').files;
        
        if (!jobId || files.length === 0) {
            alert('Veuillez sélectionner une offre d\'emploi et au moins un CV.');
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analyse en cours...';
        
        try {
            // Get job from Firestore
            const { doc, getDoc } = window.firebaseModules;
            const db = window.db;
            const jobDoc = await getDoc(doc(db, 'jobs', jobId));
            
            if (!jobDoc.exists()) {
                throw new Error('Offre d\'emploi non trouvée');
            }
            
            const job = jobDoc.data();
            
            // Process each CV
            const cvPromises = Array.from(files).map(file => processCVFile(file, job));
            const candidates = await Promise.all(cvPromises);
            
            // Sort by score
            candidates.sort((a, b) => b.scoreGlobal - a.scoreGlobal);
            
            // Save candidates to Firestore
            await saveCandidatesToFirestore(candidates, jobId);
            
            // Display results
            displayCandidatesAnalysis(candidates);
            
        } catch (error) {
            console.error('Error analyzing CVs:', error);
            alert(`Erreur lors de l'analyse des CV: ${error.message}`);
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-robot me-2"></i>Analyser les CV avec l\'IA';
        }
    });
    
    // Process a CV file
    async function processCVFile(file, job) {
        // Extract text from PDF
        const text = await extractTextFromPDF(file);
        
        // Create candidate object with basic info
        const candidate = {
            fileName: file.name,
            fileSize: file.size,
            extractedText: text,
            jobId: job.id
        };
        
        // Create analysis prompt
        const prompt = `Tu es un expert en recrutement médical. Analyse ce CV en fonction de la fiche de poste suivante, puis attribue un score sur 100. 

Fiche de poste:
Titre: ${job.title}
Département: ${job.department}
Description: ${job.description}
Missions: ${job.missions}

CV:
${text.substring(0, 4000)} // Limiting to 4000 characters to stay within token limits

Fournis ton analyse sous ce format:
1. Score global: [X/100]
2. Correspondance des compétences: [X/100]
3. Correspondance de l'expérience: [X/100]
4. Formation: [X/100]
5. Points forts:
   - [Point fort 1]
   - [Point fort 2]
6. Points d'attention:
   - [Point 1]
   - [Point 2]
7. Recommandation finale: [TEXTE]
`;
        
        // Call OpenAI API
        const analysisResult = await callOpenAI(prompt);
        
        if (analysisResult) {
            // Parse the analysis result
            const scoreGlobal = parseInt(analysisResult.match(/Score global:\s*(\d+)/i)?.[1] || '0');
            const scoreCompetences = parseInt(analysisResult.match(/Correspondance des compétences:\s*(\d+)/i)?.[1] || '0');
            const scoreExperience = parseInt(analysisResult.match(/Correspondance de l'expérience:\s*(\d+)/i)?.[1] || '0');
            const scoreFormation = parseInt(analysisResult.match(/Formation:\s*(\d+)/i)?.[1] || '0');
            
            // Extract name from CV (simple extraction, might need improvement)
            const nameMatch = text.match(/^([A-Z][a-z]+(?: [A-Z][a-z]+)*)/);
            const candidateName = nameMatch ? nameMatch[0] : `Candidat ${file.name.split('.')[0]}`;
            
            return {
                ...candidate,
                name: candidateName,
                scoreGlobal,
                scoreCompetences,
                scoreExperience,
                scoreFormation,
                analysisResult,
                timestamp: new Date().toISOString()
            };
        }
        
        return candidate;
    }
    
    // Extract text from PDF
    async function extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const typedArray = new Uint8Array(e.target.result);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    
                    let text = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const pageText = content.items.map(item => item.str).join(' ');
                        text += pageText + '\n';
                    }
                    
                    resolve(text);
                } catch (error) {
                    console.error('Error extracting text from PDF:', error);
                    reject(error);
                }
            };
            
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Save candidates to Firestore
    async function saveCandidatesToFirestore(candidates, jobId) {
        try {
            const { collection, addDoc } = window.firebaseModules;
            const db = window.db;
            
            for (const candidate of candidates) {
                await addDoc(collection(db, 'candidates'), {
                    ...candidate,
                    jobId
                });
            }
        } catch (error) {
            console.error('Error saving candidates to Firestore:', error);
        }
    }
    
    // Display candidates analysis
    function displayCandidatesAnalysis(candidates) {
        document.getElementById('analysis-results').style.display = 'block';
        
        // Display top 5 candidates
        const topCandidatesEl = document.getElementById('top-candidates');
        topCandidatesEl.innerHTML = '';
        
        candidates.slice(0, 5).forEach((candidate, index) => {
            const candidateCard = document.createElement('div');
            candidateCard.className = 'card mb-3 candidate-card';
            candidateCard.innerHTML = `
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${index + 1}. ${candidate.name}</h6>
                        <small class="text-muted">${candidate.fileName}</small>
                    </div>
                    <span class="badge ${getScoreColorClass(candidate.scoreGlobal)} score-badge">${candidate.scoreGlobal}%</span>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <div>
                        <small>Compétences: ${candidate.scoreCompetences}%</small>
                        <div class="progress" style="height: 5px;">
                            <div class="progress-bar bg-info" style="width: ${candidate.scoreCompetences}%"></div>
                        </div>
                    </div>
                    <div>
                        <small>Expérience: ${candidate.scoreExperience}%</small>
                        <div class="progress" style="height: 5px;">
                            <div class="progress-bar bg-success" style="width: ${candidate.scoreExperience}%"></div>
                        </div>
                    </div>
                    <div>
                        <small>Formation: ${candidate.scoreFormation}%</small>
                        <div class="progress" style="height: 5px;">
                            <div class="progress-bar bg-warning" style="width: ${candidate.scoreFormation}%"></div>
                        </div>
                    </div>
                </div>
            `;
            
            candidateCard.setAttribute('data-candidate-index', index);
            candidateCard.style.cursor = 'pointer';
            candidateCard.addEventListener('click', () => showCandidateDetails(candidate));
            
            topCandidatesEl.appendChild(candidateCard);
        });
        
        // Display statistics
        const statsEl = document.getElementById('cv-stats');
        statsEl.innerHTML = '';
        
        if (candidates.length > 0) {
            const avgScore = candidates.reduce((sum, c) => sum + c.scoreGlobal, 0) / candidates.length;
            const maxScore = Math.max(...candidates.map(c => c.scoreGlobal));
            const minScore = Math.min(...candidates.map(c => c.scoreGlobal));
            
            statsEl.innerHTML = `
                <p><strong>Nombre de CV:</strong> ${candidates.length}</p>
                <p><strong>Score moyen:</strong> ${avgScore.toFixed(1)}%</p>
                <p><strong>Score maximum:</strong> ${maxScore}%</p>
                <p><strong>Score minimum:</strong> ${minScore}%</p>
            `;
        } else {
            statsEl.innerHTML = '<p>Aucune donnée disponible</p>';
        }
        
        // Display candidates table
        const tableBody = document.querySelector('#candidates-table tbody');
        tableBody.innerHTML = '';
        
        candidates.forEach((candidate, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${candidate.name}</td>
                <td>${candidate.scoreGlobal}%</td>
                <td>${candidate.scoreCompetences}%</td>
                <td>${candidate.scoreExperience}%</td>
                <td>${candidate.scoreFormation}%</td>
                <td>
                    <button class="btn btn-sm btn-primary view-candidate-btn" data-candidate-index="${index}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-candidate-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-candidate-index'));
                showCandidateDetails(candidates[index]);
            });
        });
        
        // Store candidates in sessionStorage for other tabs
        sessionStorage.setItem('analyzedCandidates', JSON.stringify(candidates));
        
        // Refresh candidates in interview questions tab
        refreshCandidatesInInterviewTab();
    }
    
    // Show candidate details in modal
    function showCandidateDetails(candidate) {
        const modal = new bootstrap.Modal(document.getElementById('candidate-modal'));
        const detailsEl = document.getElementById('candidate-details');
        
        detailsEl.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <h5>${candidate.name}</h5>
                    <p class="text-muted">${candidate.fileName}</p>
                </div>
                <div class="col-md-6 text-end">
                    <h2 class="mb-0 ${getScoreColorClass(candidate.scoreGlobal, 'text')}">${candidate.scoreGlobal}%</h2>
                    <p class="text-muted">Score global</p>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>${candidate.scoreCompetences}%</h3>
                            <p class="mb-0">Compétences</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>${candidate.scoreExperience}%</h3>
                            <p class="mb-0">Expérience</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <h3>${candidate.scoreFormation}%</h3>
                            <p class="mb-0">Formation</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <h5>Analyse complète</h5>
            <div class="p-3 bg-light rounded">
                ${formatText(candidate.analysisResult)}
            </div>
        `;
        
        // Set selected candidate for interview button
        document.getElementById('select-for-interview-btn').onclick = function() {
            sessionStorage.setItem('selectedCandidate', JSON.stringify(candidate));
            modal.hide();
            
            // Switch to interview questions tab
            document.querySelector('.nav-link[data-tab="interview-questions"]').click();
            
            // Pre-select the candidate
            const candidateSelect = document.getElementById('interview-candidate-select');
            const option = Array.from(candidateSelect.options).find(opt => 
                opt.textContent.includes(candidate.name)
            );
            
            if (option) {
                candidateSelect.value = option.value;
                option.selected = true;
                candidateSelect.dispatchEvent(new Event('change'));
            }
        };
        
        modal.show();
    }
    
    // Utility function to get color class based on score
    function getScoreColorClass(score, type = 'bg') {
        if (score >= 80) return `${type}-success`;
        if (score >= 60) return `${type}-info`;
        if (score >= 40) return `${type}-warning`;
        return `${type}-danger`;
    }
}

// ---- APP 3: INTERVIEW QUESTIONS ----
function setupInterviewQuestions() {
    // Job selection change
    document.getElementById('interview-job-select').addEventListener('change', function() {
        checkGenerateQuestionsButtonState();
    });
    
    // Candidate selection change
    document.getElementById('interview-candidate-select').addEventListener('change', function() {
        const candidateId = this.value;
        if (!candidateId) {
            document.getElementById('interview-candidate-profile').innerHTML = '<p class="text-muted text-center">Sélectionnez un candidat pour voir son profil.</p>';
            return;
        }
        
        // Get the candidate
        const candidates = JSON.parse(sessionStorage.getItem('analyzedCandidates') || '[]');
        const selectedIndex = this.selectedIndex - 1; // -1 because of the placeholder option
        
        if (selectedIndex >= 0 && selectedIndex < candidates.length) {
            const candidate = candidates[selectedIndex];
            
            document.getElementById('interview-candidate-profile').innerHTML = `
                <div class="mb-3">
                    <h6>${candidate.name}</h6>
                    <p class="text-muted">${candidate.fileName}</p>
                </div>
                <div class="mb-3">
                    <span class="badge ${getScoreColorClass(candidate.scoreGlobal)}">${candidate.scoreGlobal}% Score global</span>
                </div>
                <p><strong>Points forts:</strong></p>
                <div class="points-forts">
                    ${extractPointsForts(candidate.analysisResult)}
                </div>
            `;
        }
        
        checkGenerateQuestionsButtonState();
    });
    
    // Check generate questions button state
    function checkGenerateQuestionsButtonState() {
        const jobSelect = document.getElementById('interview-job-select');
        const candidateSelect = document.getElementById('interview-candidate-select');
        const generateBtn = document.getElementById('generate-questions-btn');
        
        generateBtn.disabled = !(jobSelect.value && candidateSelect.value);
    }
    
    // Generate questions button
    document.getElementById('generate-questions-btn').addEventListener('click', async function() {
        const jobId = document.getElementById('interview-job-select').value;
        const candidateSelect = document.getElementById('interview-candidate-select');
        
        if (!jobId || !candidateSelect.value) {
            alert('Veuillez sélectionner une offre d\'emploi et un candidat.');
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Génération en cours...';
        
        try {
            // Get job from Firestore
            const { doc, getDoc } = window.firebaseModules;
            const db = window.db;
            const jobDoc = await getDoc(doc(db, 'jobs', jobId));
            
            if (!jobDoc.exists()) {
                throw new Error('Offre d\'emploi non trouvée');
            }
            
            const job = jobDoc.data();
            
            // Get the candidate
            const candidates = JSON.parse(sessionStorage.getItem('analyzedCandidates') || '[]');
            const selectedIndex = candidateSelect.selectedIndex - 1; // -1 because of the placeholder option
            
            if (selectedIndex < 0 || selectedIndex >= candidates.length) {
                throw new Error('Candidat non trouvé');
            }
            
            const candidate = candidates[selectedIndex];
            
            // Create prompt
            const prompt = `En tant qu'expert RH dans le secteur médical, génère 10 questions d'entretien personnalisées pour ce candidat et ce poste.

Poste: ${job.title}
Description du poste: ${job.description}
Missions: ${job.missions}

Profil du candidat: 
Nom: ${candidate.name}
Score global: ${candidate.scoreGlobal}%
Compétences: ${candidate.scoreCompetences}%
Expérience: ${candidate.scoreExperience}%
Formation: ${candidate.scoreFormation}%

Extrait du CV:
${candidate.extractedText.substring(0, 2000)} // Limiting to 2000 characters

Les questions doivent couvrir:
1. 3 questions techniques spécifiques au domaine médical
2. 3 questions comportementales basées sur le profil du candidat
3. 2 questions sur les motivations et le projet professionnel
4. 2 questions sur des situations spécifiques au poste

Présente les questions par catégorie et ajoute pour chacune ce que tu cherches à évaluer.`;
            
            // Call OpenAI API
            const generatedQuestions = await callOpenAI(prompt);
            
            if (generatedQuestions) {
                // Save questions to Firestore
                await saveQuestionsToFirestore(generatedQuestions, jobId, candidate);
                
                // Display questions
                displayInterviewQuestions(generatedQuestions);
            }
            
        } catch (error) {
            console.error('Error generating questions:', error);
            alert(`Erreur lors de la génération des questions: ${error.message}`);
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-question-circle me-2"></i>Générer les questions';
        }
    });
    
    // Save questions to Firestore
    async function saveQuestionsToFirestore(questions, jobId, candidate) {
        try {
            const { collection, addDoc } = window.firebaseModules;
            const db = window.db;
            
            // Add interview to Firestore
            const interviewRef = await addDoc(collection(db, 'interviews'), {
                jobId,
                candidateName: candidate.name,
                candidateId: candidate.id,
                questions,
                timestamp: new Date().toISOString()
            });
            
            // Store interview ID in sessionStorage for evaluation tab
            sessionStorage.setItem('currentInterviewId', interviewRef.id);
            
        } catch (error) {
            console.error('Error saving questions to Firestore:', error);
        }
    }
    
    // Display interview questions
    function displayInterviewQuestions(questions) {
        document.getElementById('questions-container').style.display = 'block';
        const accordionEl = document.getElementById('questions-accordion');
        accordionEl.innerHTML = '';
        
        // Split questions by category
        const categories = questions.split(/#+\s+/);
        let questionId = 1;
        
        categories.filter(cat => cat.trim()).forEach((category, categoryIndex) => {
            const categoryLines = category.split('\n');
            const categoryTitle = categoryLines[0].trim();
            const categoryContent = categoryLines.slice(1).join('\n');
            
            // Extract individual questions
            const categoryQuestions = categoryContent.split(/\d+\.\s+/).filter(q => q.trim());
            
            // Create accordion item for category
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            accordionItem.innerHTML = `
                <h2 class="accordion-header" id="heading${categoryIndex}">
                    <button class="accordion-button ${categoryIndex === 0 ? '' : 'collapsed'}" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#collapse${categoryIndex}">
                        ${categoryTitle}
                    </button>
                </h2>
                <div id="collapse${categoryIndex}" class="accordion-collapse collapse ${categoryIndex === 0 ? 'show' : ''}" 
                     data-bs-parent="#questions-accordion">
                    <div class="accordion-body">
                        <ol class="questions-list">
                        </ol>
                    </div>
                </div>
            `;
            
            accordionEl.appendChild(accordionItem);
            
            // Add questions to the list
            const questionsList = accordionItem.querySelector('.questions-list');
            
            categoryQuestions.forEach(question => {
                // Split question and evaluation criteria
                const parts = question.split(/Ce que vous cherchez à évaluer|Ce que vous évaluez|Objectif|Évaluation/i);
                const questionText = parts[0].trim();
                const evaluationText = parts.length > 1 ? parts[1].trim() : '';
                
                const questionItem = document.createElement('li');
                questionItem.className = 'mb-3';
                questionItem.innerHTML = `
                    <div class="question-text">${questionText}</div>
                    ${evaluationText ? `
                        <div class="mt-2 ps-3 border-start">
                            <small class="text-muted"><strong>Objectif:</strong> ${evaluationText}</small>
                        </div>
                    ` : ''}
                `;
                
                questionsList.appendChild(questionItem);
                
                // Store the question in sessionStorage for evaluation
                const questionData = {
                    id: questionId++,
                    text: questionText,
                    evaluation: evaluationText
                };
                
                const questions = JSON.parse(sessionStorage.getItem('interviewQuestions') || '[]');
                questions.push(questionData);
                sessionStorage.setItem('interviewQuestions', JSON.stringify(questions));
            });
        });
        
        // Update evaluation tab
        refreshQuestionsInEvaluationTab();
    }
    
    // Extract points forts from analysis result
    function extractPointsForts(analysisResult) {
        if (!analysisResult) return '';
        
        const pointsFortsMatch = analysisResult.match(/Points forts[:\s]*\n((?:[-*]\s+[^\n]+\n?)+)/i);
        if (!pointsFortsMatch || pointsFortsMatch.length < 2) return '';
        
        const pointsForts = pointsFortsMatch[1]
            .split(/[-*]\s+/)
            .filter(p => p.trim())
            .map(p => `<li>${p.trim()}</li>`)
            .join('');
        
        return `<ul>${pointsForts}</ul>`;
    }
    
    // Print questions button
    document.getElementById('print-questions-btn').addEventListener('click', function() {
        const questionsEl = document.getElementById('questions-accordion').cloneNode(true);
        
        // Open all accordion items for printing
        questionsEl.querySelectorAll('.accordion-collapse').forEach(item => {
            item.classList.add('show');
        });
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Questions d'entretien</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; }
                    .accordion-button::after { display: none; }
                    .accordion-button { cursor: default; }
                    .accordion-button:not(.collapsed) { background-color: #f8f9fa; color: #212529; }
                    @media print {
                        .accordion-button { break-inside: avoid; }
                        li { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h1 class="mb-4">Questions d'entretien</h1>
                <div class="mb-3">
                    <p><strong>Candidat:</strong> ${document.getElementById('interview-candidate-select').options[document.getElementById('interview-candidate-select').selectedIndex].text}</p>
                    <p><strong>Poste:</strong> ${document.getElementById('interview-job-select').options[document.getElementById('interview-job-select').selectedIndex].text}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                ${questionsEl.outerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    });
    
    // Refresh candidates in interview tab
    function refreshCandidatesInInterviewTab() {
        const candidates = JSON.parse(sessionStorage.getItem('analyzedCandidates') || '[]');
        const candidateSelect = document.getElementById('interview-candidate-select');
        
        // Clear existing options
        const firstOption = candidateSelect.options[0];
        candidateSelect.innerHTML = '';
        candidateSelect.appendChild(firstOption);
        
        // Add candidates
        candidates.forEach((candidate, index) => {
            const option = new Option(`${candidate.name} (Score: ${candidate.scoreGlobal}%)`, index);
            candidateSelect.appendChild(option);
        });
        
        // Check if there's a selected candidate from the CV analyzer
        const selectedCandidate = JSON.parse(sessionStorage.getItem('selectedCandidate') || 'null');
        if (selectedCandidate) {
            const selectedIndex = candidates.findIndex(c => c.name === selectedCandidate.name);
            if (selectedIndex >= 0) {
                candidateSelect.value = selectedIndex;
                candidateSelect.dispatchEvent(new Event('change'));
            }
            sessionStorage.removeItem('selectedCandidate');
        }
    }
}

// ---- APP 4: ANSWER EVALUATOR ----
function setupAnswerEvaluator() {
    // Job selection change
    document.getElementById('eval-job-select').addEventListener('change', function() {
        // Refresh candidates dropdown
        const jobId = this.value;
        if (!jobId) return;
        
        const candidates = JSON.parse(sessionStorage.getItem('analyzedCandidates') || '[]');
        const candidateSelect = document.getElementById('eval-candidate-select');
        
        // Clear existing options
        const firstOption = candidateSelect.options[0];
        candidateSelect.innerHTML = '';
        candidateSelect.appendChild(firstOption);
        
        // Add candidates for this job
        candidates.forEach((candidate, index) => {
            const option = new Option(`${candidate.name}`, index);
            candidateSelect.appendChild(option);
        });
    });
    
    // Candidate selection change
    document.getElementById('eval-candidate-select').addEventListener('change', function() {
        // Enable question dropdown
        document.getElementById('eval-question-select').disabled = false;
        
        // Load questions
        refreshQuestionsInEvaluationTab();
    });
    
    // Question selection change
    document.getElementById('eval-question-select').addEventListener('change', function() {
        const questionId = this.value;
        if (!questionId) {
            document.getElementById('selected-question').innerHTML = '<p class="text-muted text-center">Sélectionnez une question.</p>';
            return;
        }
        
        // Get the question
        const questions = JSON.parse(sessionStorage.getItem('interviewQuestions') || '[]');
        const question = questions.find(q => q.id == questionId);
        
        if (question) {
            document.getElementById('selected-question').innerHTML = `
                <div class="mb-2">${question.text}</div>
                ${question.evaluation ? `
                    <div class="mt-2 ps-3 border-start">
                        <small class="text-muted"><strong>Objectif:</strong> ${question.evaluation}</small>
                    </div>
                ` : ''}
            `;
        }
        
        // Enable evaluate button if there's an answer
        checkEvaluateButtonState();
    });
    
    // Answer input change
    document.getElementById('candidate-answer').addEventListener('input', function() {
        checkEvaluateButtonState();
    });
    
    // Check evaluate button state
    function checkEvaluateButtonState() {
        const questionSelect = document.getElementById('eval-question-select');
        const answerInput = document.getElementById('candidate-answer');
        const evaluateBtn = document.getElementById('evaluate-answer-btn');
        
        evaluateBtn.disabled = !(questionSelect.value && answerInput.value.trim().length > 10);
    }
    
    // Evaluate answer button
    document.getElementById('evaluate-answer-btn').addEventListener('click', async function() {
        const jobId = document.getElementById('eval-job-select').value;
        const candidateIndex = document.getElementById('eval-candidate-select').value;
        const questionId = document.getElementById('eval-question-select').value;
        const answer = document.getElementById('candidate-answer').value;
        
        if (!jobId || !candidateIndex || !questionId || !answer.trim()) {
            alert('Veuillez sélectionner une offre d\'emploi, un candidat, une question et saisir une réponse.');
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Évaluation en cours...';
        
        try {
            // Get job from Firestore
            const { doc, getDoc } = window.firebaseModules;
            const db = window.db;
            const jobDoc = await getDoc(doc(db, 'jobs', jobId));
            
            if (!jobDoc.exists()) {
                throw new Error('Offre d\'emploi non trouvée');
            }
            
            const job = jobDoc.data();
            
            // Get the candidate
            const candidates = JSON.parse(sessionStorage.getItem('analyzedCandidates') || '[]');
            if (candidateIndex < 0 || candidateIndex >= candidates.length) {
                throw new Error('Candidat non trouvé');
            }
            
            const candidate = candidates[candidateIndex];
            
            // Get the question
            const questions = JSON.parse(sessionStorage.getItem('interviewQuestions') || '[]');
            const question = questions.find(q => q.id == questionId);
            
            if (!question) {
                throw new Error('Question non trouvée');
            }
            
            // Create prompt
            const prompt = `En tant qu'expert RH dans le secteur médical, évalue la réponse suivante à cette question d'entretien.

Poste: ${job.title}
Description du poste: ${job.description}

Question: ${question.text}
${question.evaluation ? `Objectif de la question: ${question.evaluation}` : ''}

Réponse du candidat: "${answer}"

Fournis ton évaluation selon ces critères:
1. Pertinence (note de 1 à 5): [ÉVALUATION] 
2. Clarté et structure (1-5): [ÉVALUATION]
3. Expertise technique (1-5): [ÉVALUATION]
4. Adéquation avec les besoins du poste (1-5): [ÉVALUATION]
5. Score global (sur 20): [CALCUL]

Analyse détaillée (100 mots max): [ANALYSE]
Points forts: 
- [POINT FORT 1]
- [POINT FORT 2]

Axes d'amélioration:
- [AXE 1]
- [AXE 2]`;
            
            // Call OpenAI API
            const evaluationResult = await callOpenAI(prompt);
            
            if (evaluationResult) {
                // Save evaluation to Firestore
                await saveEvaluationToFirestore({
                    jobId,
                    candidateName: candidate.name,
                    candidateId: candidate.id,
                    questionId,
                    questionText: question.text,
                    answer,
                    evaluation: evaluationResult
                });
                
                // Display evaluation
                displayEvaluation(evaluationResult);
            }
            
        } catch (error) {
            console.error('Error evaluating answer:', error);
            alert(`Erreur lors de l'évaluation de la réponse: ${error.message}`);
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-check-circle me-2"></i>Évaluer la réponse';
        }
    });
    
    // Save evaluation to Firestore
    async function saveEvaluationToFirestore(evaluationData) {
        try {
            const { collection, addDoc } = window.firebaseModules;
            const db = window.db;
            
            // Add evaluation to Firestore
            await addDoc(collection(db, 'evaluations'), {
                ...evaluationData,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error saving evaluation to Firestore:', error);
        }
    }
    
    // Display evaluation
    function displayEvaluation(evaluation) {
        document.getElementById('evaluation-results').style.display = 'block';
        
        // Parse scores
        const relevanceMatch = evaluation.match(/Pertinence.*?(\d+)/);
        const clarityMatch = evaluation.match(/Clarté et structure.*?(\d+)/);
        const expertiseMatch = evaluation.match(/Expertise technique.*?(\d+)/);
        const fitMatch = evaluation.match(/Adéquation.*?(\d+)/);
        const overallMatch = evaluation.match(/Score global.*?(\d+)/);
        
        const relevanceScore = relevanceMatch ? parseInt(relevanceMatch[1]) : 0;
        const clarityScore = clarityMatch ? parseInt(clarityMatch[1]) : 0;
        const expertiseScore = expertiseMatch ? parseInt(expertiseMatch[1]) : 0;
        const fitScore = fitMatch ? parseInt(fitMatch[1]) : 0;
        const overallScore = overallMatch ? parseInt(overallMatch[1]) : 0;
        
        // Update scores
        document.getElementById('overall-score').innerText = `${overallScore}/20`;
        document.getElementById('score-progress').style.width = `${(overallScore / 20) * 100}%`;
        
        document.getElementById('relevance-score').style.width = `${(relevanceScore / 5) * 100}%`;
        document.getElementById('relevance-score').innerText = relevanceScore;
        
        document.getElementById('clarity-score').style.width = `${(clarityScore / 5) * 100}%`;
        document.getElementById('clarity-score').innerText = clarityScore;
        
        document.getElementById('expertise-score').style.width = `${(expertiseScore / 5) * 100}%`;
        document.getElementById('expertise-score').innerText = expertiseScore;
        
        document.getElementById('fit-score').style.width = `${(fitScore / 5) * 100}%`;
        document.getElementById('fit-score').innerText = fitScore;
        
        // Parse analysis
        const analysisMatch = evaluation.match(/Analyse détaillée.*?:(.*?)Points forts/s);
        const analysis = analysisMatch ? analysisMatch[1].trim() : '';
        
        // Parse strengths
        const strengthsMatch = evaluation.match(/Points forts:(.*?)Axes d'amélioration/s);
        const strengths = strengthsMatch ? strengthsMatch[1].trim() : '';
        
        // Parse improvements
        const improvementsMatch = evaluation.match(/Axes d'amélioration:(.*?)$/s);
        const improvements = improvementsMatch ? improvementsMatch[1].trim() : '';
        
        // Update text content
        document.getElementById('detailed-analysis').innerText = analysis;
        
        const strengthsList = document.getElementById('strengths-list');
        strengthsList.innerHTML = '';
        strengths.split(/[-*]\s+/).filter(s => s.trim()).forEach(strength => {
            const li = document.createElement('li');
            li.innerText = strength.trim();
            strengthsList.appendChild(li);
        });
        
        const improvementsList = document.getElementById('improvements-list');
        improvementsList.innerHTML = '';
        improvements.split(/[-*]\s+/).filter(i => i.trim()).forEach(improvement => {
            const li = document.createElement('li');
            li.innerText = improvement.trim();
            improvementsList.appendChild(li);
        });
    }
}

// ---- APP 5: ONBOARDING ----
function setupOnboarding() {
    // Set default date
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() +
	    // Set default date
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('employee-start-date').value = nextMonth.toISOString().split('T')[0];
    
    // Job selection change
    document.getElementById('onboarding-job-select').addEventListener('change', function() {
        const jobId = this.value;
        if (!jobId) return;
        
        try {
            const { doc, getDoc } = window.firebaseModules;
            const db = window.db;
            
            // Get job from Firestore
            getDoc(doc(db, 'jobs', jobId)).then(jobDoc => {
                if (jobDoc.exists()) {
                    const job = jobDoc.data();
                    // Auto-fill department
                    document.getElementById('employee-department').value = job.department || '';
                }
            });
        } catch (error) {
            console.error('Error fetching job details:', error);
        }
    });
    
    // Generate onboarding plan button
    document.getElementById('onboarding-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const generateBtn = document.getElementById('generate-onboarding-btn');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Génération en cours...';
        
        try {
            // Get form values
            const name = document.getElementById('employee-name').value;
            const jobId = document.getElementById('onboarding-job-select').value;
            const department = document.getElementById('employee-department').value;
            const startDate = document.getElementById('employee-start-date').value;
            const experience = document.getElementById('employee-experience').value;
            
            // Get additional options
            const facilityType = document.getElementById('facility-type').value;
            const onboardingDuration = document.getElementById('onboarding-duration').value;
            const includeMentor = document.getElementById('include-mentor').checked;
            const includeTraining = document.getElementById('include-training').checked;
            const includeCheckpoints = document.getElementById('include-checkpoints').checked;
            
            // Get job from Firestore
            const { doc, getDoc } = window.firebaseModules;
            const db = window.db;
            
            let jobTitle = '';
            let jobDescription = '';
            
            if (jobId) {
                const jobDoc = await getDoc(doc(db, 'jobs', jobId));
                if (jobDoc.exists()) {
                    const job = jobDoc.data();
                    jobTitle = job.title;
                    jobDescription = job.description;
                }
            }
            
            // Create prompt
            const prompt = `En tant qu'expert RH dans le secteur médical, crée un plan d'onboarding personnalisé pour ce nouvel employé.

Informations:
- Nom: ${name}
- Poste: ${jobTitle || 'Non spécifié'}
${jobDescription ? `- Description du poste: ${jobDescription}` : ''}
- Département: ${department}
- Date de début: ${startDate}
- Expérience précédente: ${experience || 'Non spécifiée'}
- Type d'établissement: ${facilityType}
- Durée du plan d'onboarding: ${onboardingDuration} jours

Options incluses:
${includeMentor ? '- Programme de mentorat' : ''}
${includeTraining ? '- Formations spécifiques' : ''}
${includeCheckpoints ? '- Points de contrôle réguliers' : ''}

Génère:
1. Un calendrier d'onboarding détaillé sur ${onboardingDuration} jours avec des activités quotidiennes pour les premiers jours, puis hebdomadaires
2. Une checklist pour le manager avec des actions clés (avant l'arrivée, premier jour, première semaine, premier mois)
3. Une checklist pour le nouvel employé
4. 5 ressources essentielles à fournir (documents, accès, formations)
5. 3 objectifs clés pour les ${onboardingDuration} premiers jours

Organise le tout de manière chronologique et adaptée au contexte médical de ${facilityType}.`;
            
            // Call OpenAI API
            const generatedPlan = await callOpenAI(prompt);
            
            if (generatedPlan) {
                // Save onboarding plan to Firestore
                await saveOnboardingPlanToFirestore({
                    employeeName: name,
                    jobId,
                    jobTitle,
                    department,
                    startDate,
                    experience,
                    facilityType,
                    onboardingDuration,
                    includeMentor,
                    includeTraining,
                    includeCheckpoints,
                    plan: generatedPlan
                });
                
                // Display onboarding plan
                displayOnboardingPlan(generatedPlan, name, jobTitle, startDate);
            }
            
        } catch (error) {
            console.error('Error generating onboarding plan:', error);
            alert(`Erreur lors de la génération du plan d'onboarding: ${error.message}`);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Générer le plan d\'onboarding';
        }
    });
    
    // Save onboarding plan to Firestore
    async function saveOnboardingPlanToFirestore(planData) {
        try {
            const { collection, addDoc } = window.firebaseModules;
            const db = window.db;
            
            // Add onboarding plan to Firestore
            await addDoc(collection(db, 'onboarding'), {
                ...planData,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error saving onboarding plan to Firestore:', error);
        }
    }
    
    // Display onboarding plan
    function displayOnboardingPlan(plan, name, position, startDate) {
        document.getElementById('onboarding-results').style.display = 'block';
        
        // Parse the plan into sections
        const calendarSection = extractSection(plan, 'calendrier', ['checklist', 'ressources', 'objectifs']);
        const managerChecklistSection = extractSection(plan, 'checklist pour le manager', ['checklist pour le nouvel employé', 'ressources', 'objectifs']);
        const employeeChecklistSection = extractSection(plan, 'checklist pour le nouvel employé', ['ressources', 'objectifs']);
        const resourcesSection = extractSection(plan, 'ressources', ['objectifs']);
        const objectivesSection = extractSection(plan, 'objectifs', []);
        
        // Format calendar
        const calendarEl = document.getElementById('onboarding-calendar');
        calendarEl.innerHTML = formatCalendar(calendarSection, new Date(startDate));
        
        // Format checklists
        document.getElementById('manager-checklist').innerHTML = formatChecklist(managerChecklistSection);
        document.getElementById('employee-checklist').innerHTML = formatChecklist(employeeChecklistSection);
        
        // Format resources and objectives
        document.getElementById('resources-list').innerHTML = formatResourcesList(resourcesSection);
        document.getElementById('objectives-list').innerHTML = formatObjectivesList(objectivesSection);
        
        // Enable print and export buttons
        document.getElementById('print-onboarding-btn').disabled = false;
        document.getElementById('export-calendar-btn').disabled = false;
    }
    
    // Extract a section from the generated plan
    function extractSection(text, sectionName, nextSections) {
        if (!text) return '';
        
        // Create a regex pattern to match the section
        const sectionPattern = new RegExp(`(?:##?\\s*${sectionName}|\\d+\\.\\s*${sectionName})([\\s\\S]*?)(?:(?:##?\\s*|\\d+\\.\\s*)(${nextSections.join('|')})|$)`, 'i');
        
        const match = text.match(sectionPattern);
        return match ? match[1].trim() : '';
    }
    
    // Format calendar section
    function formatCalendar(calendarText, startDate) {
        if (!calendarText) return '<p class="text-muted">Aucun calendrier généré.</p>';
        
        // Look for day entries
        const dayEntries = [];
        const dayPattern = /(?:jour|semaine|mois)\s+(\d+)[\s:]+([\s\S]*?)(?=(?:jour|semaine|mois)\s+\d+|$)/gi;
        
        let match;
        while ((match = dayPattern.exec(calendarText)) !== null) {
            const dayNumber = parseInt(match[1]);
            const activities = match[2].trim();
            
            dayEntries.push({
                day: dayNumber,
                activities: activities.split(/[-*]\s+/).filter(a => a.trim()).map(a => a.trim())
            });
        }
        
        // If no structured days found, try another approach
        if (dayEntries.length === 0) {
            const lines = calendarText.split('\n');
            let currentDay = null;
            
            lines.forEach(line => {
                const dayMatch = line.match(/(?:jour|semaine|mois)\s+(\d+)[\s:]+(.+)/i);
                if (dayMatch) {
                    currentDay = parseInt(dayMatch[1]);
                    const activity = dayMatch[2].trim();
                    if (activity) {
                        dayEntries.push({
                            day: currentDay,
                            activities: [activity]
                        });
                    } else {
                        dayEntries.push({
                            day: currentDay,
                            activities: []
                        });
                    }
                } else if (currentDay !== null && line.trim().match(/^[-*]\s+/)) {
                    const activity = line.replace(/^[-*]\s+/, '').trim();
                    if (activity) {
                        const entry = dayEntries.find(e => e.day === currentDay);
                        if (entry) {
                            entry.activities.push(activity);
                        }
                    }
                }
            });
        }
        
        // Sort by day
        dayEntries.sort((a, b) => a.day - b.day);
        
        // Generate HTML
        let html = '';
        const startDateObj = new Date(startDate);
        
        dayEntries.forEach(entry => {
            const currentDate = new Date(startDateObj);
            currentDate.setDate(startDateObj.getDate() + entry.day - 1); // -1 because day 1 is start date
            
            const dateString = currentDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            html += `
                <div class="calendar-day">
                    <div class="calendar-day-header">
                        Jour ${entry.day} - ${dateString}
                    </div>
                    <ul class="list-group">
                        ${entry.activities.map(activity => `
                            <li class="list-group-item">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="activity-${entry.day}-${activity.substring(0, 10).replace(/\s+/g, '-')}">
                                    <label class="form-check-label" for="activity-${entry.day}-${activity.substring(0, 10).replace(/\s+/g, '-')}">
                                        ${activity}
                                    </label>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });
        
        return html || '<p class="text-muted">Aucun calendrier généré.</p>';
    }
    
    // Format checklist section
    function formatChecklist(checklistText) {
        if (!checklistText) return '<p class="text-muted">Aucune checklist générée.</p>';
        
        // Split into categories if they exist
        const categories = checklistText.split(/##?(?:\s+|\_)([^\n]+)/);
        
        if (categories.length > 1) {
            let html = '';
            
            for (let i = 1; i < categories.length; i += 2) {
                const categoryTitle = categories[i];
                const categoryItems = categories[i + 1] || '';
                
                html += `
                    <div class="mb-4">
                        <h5>${categoryTitle}</h5>
                        <ul class="list-group">
                            ${categoryItems.split(/[-*]\s+/).filter(item => item.trim()).map(item => `
                                <li class="list-group-item">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="checklist-${item.substring(0, 10).replace(/\s+/g, '-')}">
                                        <label class="form-check-label" for="checklist-${item.substring(0, 10).replace(/\s+/g, '-')}">
                                            ${item.trim()}
                                        </label>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            }
            
            return html;
        } else {
            // No categories, just a list of items
            return `
                <ul class="list-group">
                    ${checklistText.split(/[-*]\s+/).filter(item => item.trim()).map(item => `
                        <li class="list-group-item">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="checklist-${item.substring(0, 10).replace(/\s+/g, '-')}">
                                <label class="form-check-label" for="checklist-${item.substring(0, 10).replace(/\s+/g, '-')}">
                                    ${item.trim()}
                                </label>
                            </div>
                        </li>
                    `).join('')}
                </ul>
            `;
        }
    }
    
    // Format resources list
    function formatResourcesList(resourcesText) {
        if (!resourcesText) return '<p class="text-muted">Aucune ressource générée.</p>';
        
        return `
            <div class="list-group">
                ${resourcesText.split(/[-*]\s+/).filter(item => item.trim()).map(item => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-file-alt me-2 text-primary"></i> 
                                ${item.trim()}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Format objectives list
    function formatObjectivesList(objectivesText) {
        if (!objectivesText) return '<p class="text-muted">Aucun objectif généré.</p>';
        
        return `
            <div class="list-group">
                ${objectivesText.split(/[-*]\s+/).filter(item => item.trim()).map((item, index) => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="badge bg-primary me-2">${index + 1}</span>
                                ${item.trim()}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Print onboarding plan button
    document.getElementById('print-onboarding-btn').addEventListener('click', function() {
        const employeeName = document.getElementById('employee-name').value;
        const jobTitle = document.getElementById('onboarding-job-select').options[document.getElementById('onboarding-job-select').selectedIndex].text;
        const startDate = new Date(document.getElementById('employee-start-date').value).toLocaleDateString('fr-FR');
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Plan d'onboarding - ${employeeName}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
                <style>
                    body { padding: 20px; }
                    .section { margin-bottom: 30px; }
                    .section-title { margin-bottom: 20px; border-bottom: 2px solid #0d6efd; padding-bottom: 10px; }
                    .calendar-day { border: 1px solid #dee2e6; padding: 10px; margin-bottom: 20px; break-inside: avoid; }
                    .calendar-day-header { font-weight: bold; background-color: #e9ecef; padding: 5px; margin-bottom: 10px; }
                    @media print {
                        .pagebreak { page-break-before: always; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="row mb-4">
                        <div class="col-12 text-center">
                            <h1>Plan d'onboarding</h1>
                            <h3>${employeeName} - ${jobTitle}</h3>
                            <p>Date de début: ${startDate}</p>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2 class="section-title">Calendrier</h2>
                        ${document.getElementById('onboarding-calendar').innerHTML}
                    </div>
                    
                    <div class="pagebreak"></div>
                    
                    <div class="section">
                        <h2 class="section-title">Checklist pour le Manager</h2>
                        ${document.getElementById('manager-checklist').innerHTML}
                    </div>
                    
                    <div class="pagebreak"></div>
                    
                    <div class="section">
                        <h2 class="section-title">Checklist pour l'Employé</h2>
                        ${document.getElementById('employee-checklist').innerHTML}
                    </div>
                    
                    <div class="section">
                        <h2 class="section-title">Ressources</h2>
                        ${document.getElementById('resources-list').innerHTML}
                    </div>
                    
                    <div class="section">
                        <h2 class="section-title">Objectifs</h2>
                        ${document.getElementById('objectives-list').innerHTML}
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    });
    
    // Export calendar button
    document.getElementById('export-calendar-btn').addEventListener('click', function() {
        const employeeName = document.getElementById('employee-name').value;
        const startDateStr = document.getElementById('employee-start-date').value;
        
        alert(`Cette fonctionnalité permettrait d'exporter le calendrier d'onboarding pour ${employeeName} au format iCal, qui pourrait être importé dans Outlook, Google Calendar, etc.`);
        
        // In a real application, we would generate an iCal file here
    });
}

// Utility functions for different parts of the app

// Refresh candidates in interview questions tab
function refreshCandidatesInInterviewTab() {
    const candidates = JSON.parse(sessionStorage.getItem('analyzedCandidates') || '[]');
    const candidateSelect = document.getElementById('interview-candidate-select');
    
    // Clear existing options
    const firstOption = candidateSelect.options[0];
    candidateSelect.innerHTML = '';
    candidateSelect.appendChild(firstOption);
    
    // Add candidates
    candidates.forEach((candidate, index) => {
        const option = new Option(`${candidate.name} (Score: ${candidate.scoreGlobal}%)`, index);
        candidateSelect.appendChild(option);
    });
    
    // Check if there's a selected candidate from the CV analyzer
    const selectedCandidate = JSON.parse(sessionStorage.getItem('selectedCandidate') || 'null');
    if (selectedCandidate) {
        const selectedIndex = candidates.findIndex(c => c.name === selectedCandidate.name);
        if (selectedIndex >= 0) {
            candidateSelect.value = selectedIndex;
            candidateSelect.dispatchEvent(new Event('change'));
        }
        sessionStorage.removeItem('selectedCandidate');
    }
}

// Refresh questions in evaluation tab
function refreshQuestionsInEvaluationTab() {
    const candidateSelect = document.getElementById('eval-candidate-select');
    const questionSelect = document.getElementById('eval-question-select');
    
    if (!candidateSelect.value) return;
    
    // Get questions from sessionStorage
    const questions = JSON.parse(sessionStorage.getItem('interviewQuestions') || '[]');
    
    // Clear existing options
    const firstOption = questionSelect.options[0];
    questionSelect.innerHTML = '';
    questionSelect.appendChild(firstOption);
    
    // Add questions
    questions.forEach(question => {
        const option = new Option(question.text.substring(0, 100) + '...', question.id);
        questionSelect.appendChild(option);
    });
    
    // Enable question dropdown
    questionSelect.disabled = false;
}
