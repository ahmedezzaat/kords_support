/**
 * State Management with Local Storage
 */
const STORAGE_KEYS = {
    COMPANIES: 'cs_portal_companies',
    CATEGORIES: 'cs_portal_categories',
    TICKETS: 'cs_portal_tickets',
    COMMENTS: 'cs_portal_comments',
    CONTACTS: 'cs_portal_contacts',
    USERS: 'cs_portal_users',
    SESSION: 'cs_portal_session',
    APP_SETTINGS: 'cs_portal_settings'
};

// Initialize empty states inside localstorage if missing
const initStorage = () => {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([
            { id: generateId(), name: "Technology" },
            { id: generateId(), name: "Healthcare" }
        ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
        localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
            { id: generateId(), name: "System Admin", email: "admin@portal.com", role: "Admin", createdAt: new Date().toISOString() }
        ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APP_SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify({ github_repo: '', github_token: '' }));
    }
};

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Data Access Object
const DB = {
    get(key) { return JSON.parse(localStorage.getItem(key)); },
    set(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
    
    // Categories
    getCategories() { return this.get(STORAGE_KEYS.CATEGORIES); },
    addCategory(name) {
        const cats = this.getCategories();
        cats.push({ id: generateId(), name });
        this.set(STORAGE_KEYS.CATEGORIES, cats);
    },
    deleteCategory(id) {
        const cats = this.getCategories().filter(c => c.id !== id);
        this.set(STORAGE_KEYS.CATEGORIES, cats);
    },

    // Companies
    getCompanies() { return this.get(STORAGE_KEYS.COMPANIES); },
    getCompany(id) { return this.getCompanies().find(c => c.id === id); },
    addCompany(company) {
        const curr = this.getCompanies();
        company.id = generateId();
        company.createdAt = new Date().toISOString();
        curr.push(company);
        this.set(STORAGE_KEYS.COMPANIES, curr);
    },
    updateCompany(id, updates) {
        const curr = this.getCompanies();
        const index = curr.findIndex(c => c.id === id);
        if (index !== -1) {
            curr[index] = { ...curr[index], ...updates };
            this.set(STORAGE_KEYS.COMPANIES, curr);
        }
    },
    deleteCompany(id) {
        const curr = this.getCompanies().filter(c => c.id !== id);
        this.set(STORAGE_KEYS.COMPANIES, curr);
        // Cascading delete contacts and tickets
        const remContacts = this.getContacts().filter(c => c.companyId !== id);
        this.set(STORAGE_KEYS.CONTACTS, remContacts);
        const remTickets = this.getTickets().filter(t => t.companyId !== id);
        this.set(STORAGE_KEYS.TICKETS, remTickets);
    },

    // Contacts
    getContacts() { return this.get(STORAGE_KEYS.CONTACTS); },
    getContactsByCompany(companyId) {
        return this.getContacts().filter(c => c.companyId === companyId);
    },
    addContact(contact) {
        const curr = this.getContacts();
        contact.id = generateId();
        contact.createdAt = new Date().toISOString();
        curr.push(contact);
        this.set(STORAGE_KEYS.CONTACTS, curr);
    },
    deleteContact(id) {
        const curr = this.getContacts().filter(c => c.id !== id);
        this.set(STORAGE_KEYS.CONTACTS, curr);
    },

    // Tickets
    getTickets() { return this.get(STORAGE_KEYS.TICKETS); },
    getTicketsByCompany(companyId) {
        return this.getTickets().filter(t => t.companyId === companyId);
    },
    addTicket(ticket) {
        const curr = this.getTickets();
        ticket.id = generateId();
        ticket.createdAt = new Date().toISOString();
        curr.push(ticket);
        this.set(STORAGE_KEYS.TICKETS, curr);
    },
    updateTicketStatus(id, status) {
        const curr = this.getTickets();
        const t = curr.find(x => x.id === id);
        if (t) { t.status = status; this.set(STORAGE_KEYS.TICKETS, curr); }
    },
    deleteTicket(id) {
        const curr = this.getTickets().filter(t => t.id !== id);
        this.set(STORAGE_KEYS.TICKETS, curr);
    },
    updateTicketDetails(id, updates) {
        const curr = this.getTickets();
        const t = curr.find(x => x.id === id);
        if (t) {
            if (updates.title) t.title = updates.title;
            if (updates.desc) t.desc = updates.desc;
            if (updates.priority) t.priority = updates.priority;
            if (updates.type) t.type = updates.type;
            if (updates.githubUrl) t.githubUrl = updates.githubUrl;
            this.set(STORAGE_KEYS.TICKETS, curr);
        }
    },

    // Comments
    getComments(ticketId) { return this.get(STORAGE_KEYS.COMMENTS).filter(c => c.ticketId === ticketId); },
    addComment(comment) {
        const curr = this.get(STORAGE_KEYS.COMMENTS);
        comment.id = generateId();
        comment.createdAt = new Date().toISOString();
        curr.push(comment);
        this.set(STORAGE_KEYS.COMMENTS, curr);
    },

    // Users
    getUsers() { return this.get(STORAGE_KEYS.USERS); },
    getUser(id) { return this.getUsers().find(u => u.id === id); },
    
    // Settings
    getSettings() { return this.get(STORAGE_KEYS.APP_SETTINGS) || {}; },
    setSettings(settings) { this.set(STORAGE_KEYS.APP_SETTINGS, settings); },
    addUser(user) {
        const curr = this.getUsers();
        user.id = generateId();
        user.createdAt = new Date().toISOString();
        curr.push(user);
        this.set(STORAGE_KEYS.USERS, curr);
    },
    deleteUser(id) {
        const curr = this.getUsers().filter(u => u.id !== id);
        this.set(STORAGE_KEYS.USERS, curr);
    },
    
    // Assignee updates
    updateTicketAssignee(id, assigneeId) {
        const curr = this.getTickets();
        const t = curr.find(x => x.id === id);
        if (t) { t.assigneeId = assigneeId; this.set(STORAGE_KEYS.TICKETS, curr); }
    }
};

/**
 * UI Rendering & Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    
    // Global State
    let currentCompanyId = null;

    // View Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    // Auth Logic
    function checkAuth() {
        const sessionUserId = DB.get(STORAGE_KEYS.SESSION);
        const loginLayout = document.getElementById('login-layout');
        const appLayout = document.getElementById('app-layout');
        
        if (!sessionUserId) {
            loginLayout.style.display = 'flex';
            appLayout.style.display = 'none';
            return false;
        }

        const user = DB.getUser(sessionUserId);
        if (!user) {
            DB.set(STORAGE_KEYS.SESSION, null);
            loginLayout.style.display = 'flex';
            appLayout.style.display = 'none';
            return false;
        }

        document.getElementById('current-user-name').innerText = user.name;
        document.getElementById('current-user-role').innerText = user.role;

        navItems.forEach(nav => {
            if (nav.dataset.target === 'settings-view' || nav.dataset.target === 'team-view') {
                nav.style.display = user.role === 'Admin' ? 'flex' : 'none';
            }
        });

        loginLayout.style.display = 'none';
        appLayout.style.display = 'flex';
        return true;
    }

    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const users = DB.getUsers();
            const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            const errorBlock = document.getElementById('login-error');
            
            if (foundUser) {
                if (foundUser.password && foundUser.password !== password) {
                    errorBlock.innerText = "Invalid credentials. Incorrect password.";
                    errorBlock.style.display = 'block';
                } else {
                    errorBlock.style.display = 'none';
                    DB.set(STORAGE_KEYS.SESSION, foundUser.id);
                    formLogin.reset();
                    if (checkAuth()) switchView('dashboard-view');
                }
            } else {
                errorBlock.innerText = "Invalid credentials. Unknown user.";
                errorBlock.style.display = 'block';
            }
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            DB.set(STORAGE_KEYS.SESSION, null);
            checkAuth();
        });
    }

    function switchView(targetId) {
        // Toggle Nav active state
        navItems.forEach(nav => {
            if (nav.dataset.target === targetId) nav.classList.add('active');
            else nav.classList.remove('active');
        });
        // Toggle View section active state
        viewSections.forEach(section => {
            if (section.id === targetId) section.classList.add('active');
            else section.classList.remove('active');
        });

        // Trigger updates based on view
        if (targetId === 'dashboard-view') updateDashboard();
        if (targetId === 'companies-view') renderCompaniesList();
        if (targetId === 'settings-view') renderCategoriesList();
        if (targetId === 'tickets-view') renderAllTickets();
        if (targetId === 'team-view') renderTeamList();
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(item.dataset.target);
        });
    });

    // Special Back Button
    document.getElementById('btn-back-companies').addEventListener('click', () => {
        switchView('companies-view');
    });

    // Modals
    const modals = {
        company: document.getElementById('modal-company'),
        contact: document.getElementById('modal-contact'),
        ticket: document.getElementById('modal-ticket'),
        user: document.getElementById('modal-user'),
        editTicket: document.getElementById('modal-edit-ticket')
    };

    const openModal = (type) => { modals[type].classList.add('active'); };
    const closeModal = (type) => { modals[type].classList.remove('active'); };

    document.querySelectorAll('.js-modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            Object.keys(modals).forEach(key => {
                if (modals[key]) modals[key].classList.remove('active');
            });
        });
    });

    // Button triggers
    document.getElementById('btn-add-company').addEventListener('click', () => {
        populateCategoryDropdown();
        document.getElementById('form-company').reset();
        document.getElementById('compId').value = '';
        document.getElementById('subscription-fields').style.display = 'none';
        document.getElementById('modal-company-title').innerText = 'Add New Company';
        document.getElementById('btn-save-company').innerText = 'Save Company';
        openModal('company');
    });

    document.getElementById('btn-add-contact').addEventListener('click', () => {
        document.getElementById('form-contact').reset();
        document.getElementById('contactCompanyId').value = currentCompanyId;
        openModal('contact');
    });

    document.getElementById('btn-add-ticket').addEventListener('click', () => {
        document.getElementById('form-ticket').reset();
        document.getElementById('ticketCompanyId').value = currentCompanyId;
        openModal('ticket');
    });

    document.getElementById('btn-edit-company').addEventListener('click', () => {
        if (currentCompanyId) window.editCompany(currentCompanyId);
    });

    /** Render Dashboard **/
    function updateDashboard() {
        document.getElementById('stat-companies').innerText = DB.getCompanies().length;
        document.getElementById('stat-contacts').innerText = DB.getContacts().length;
        document.getElementById('stat-tickets').innerText = DB.getTickets().length;
    }

    /** View: Settings (Categories) **/
    const formCategory = document.getElementById('form-category');
    const categoriesList = document.getElementById('categories-list');

    formCategory.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('categoryName');
        const val = input.value.trim();
        if (val) {
            DB.addCategory(val);
            input.value = '';
            renderCategoriesList();
        }
    });

    window.deleteCategory = (id) => {
        if(confirm("Are you sure?")) {
            DB.deleteCategory(id);
            renderCategoriesList();
        }
    };

    function renderCategoriesList() {
        const cats = DB.getCategories();
        categoriesList.innerHTML = cats.map(c => `
            <li>
                <span>${escapeHTML(c.name)}</span>
                <button class="btn btn-outline btn-small btn-danger-outline" onclick="deleteCategory('${c.id}')"><i class="ri-delete-bin-line"></i> Delete</button>
            </li>
        `).join('');
    }

    /** View: Companies List **/
    const companiesTbody = document.getElementById('companies-table-body');
    const formCompany = document.getElementById('form-company');

    formCompany.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('compId').value;
        const companyData = {
            name: document.getElementById('compName').value,
            slug: document.getElementById('compSlug').value,
            categoryId: document.getElementById('compCategory').value,
            email: document.getElementById('compEmail').value,
            phone: document.getElementById('compPhone').value,
            address: document.getElementById('compAddress').value,
            subscription: {
                start: document.getElementById('compSubStart').value,
                end: document.getElementById('compSubEnd').value,
                users: document.getElementById('compSubUsers').value,
                isTrial: document.getElementById('compSubIsTrial').checked
            }
        };

        if (id) {
            DB.updateCompany(id, companyData);
        } else {
            DB.addCompany(companyData);
        }

        closeModal('company');
        renderCompaniesList();
        updateDashboard();
        if (id && currentCompanyId === id) loadCompanyDetails(id);
    });

    // We expose global functions for inline onclick handlers inside generated innerHTML
    window.viewCompany = (id) => {
        currentCompanyId = id;
        loadCompanyDetails(id);
        switchView('company-details-view');
        // Unset any nav active highlight since this is a sub-page
        navItems.forEach(nav => nav.classList.remove('active'));
    };

    window.deleteCompany = (id) => {
        if(confirm("Delete company and all its contacts?")) {
            DB.deleteCompany(id);
            renderCompaniesList();
            updateDashboard();
        }
    };

    window.editCompany = (id) => {
        const comp = DB.getCompany(id);
        if (!comp) return;

        populateCategoryDropdown();
        document.getElementById('compId').value = comp.id;
        document.getElementById('compName').value = comp.name;
        document.getElementById('compSlug').value = comp.slug || '';
        document.getElementById('compCategory').value = comp.categoryId || '';
        document.getElementById('compEmail').value = comp.email || '';
        document.getElementById('compPhone').value = comp.phone || '';
        document.getElementById('compAddress').value = comp.address || '';

        // Subscription fields
        if (comp.subscription) {
            document.getElementById('compSubStart').value = comp.subscription.start || '';
            document.getElementById('compSubEnd').value = comp.subscription.end || '';
            document.getElementById('compSubUsers').value = comp.subscription.users || '';
            document.getElementById('compSubIsTrial').checked = comp.subscription.isTrial || false;
        } else {
            document.getElementById('compSubStart').value = '';
            document.getElementById('compSubEnd').value = '';
            document.getElementById('compSubUsers').value = '';
            document.getElementById('compSubIsTrial').checked = false;
        }

        document.getElementById('subscription-fields').style.display = 'block';
        document.getElementById('modal-company-title').innerText = 'Edit Company';
        document.getElementById('btn-save-company').innerText = 'Update Company';
        openModal('company');
    };

    function populateCategoryDropdown() {
        const sel = document.getElementById('compCategory');
        const cats = DB.getCategories();
        sel.innerHTML = `<option value="">Select a category</option> ` + 
            cats.map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join('');
    }

    function renderCompaniesList() {
        const comps = DB.getCompanies();
        const cats = DB.getCategories();
        
        if (comps.length === 0) {
            companiesTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 32px 0; color: var(--text-muted)">No companies added yet.</td></tr>`;
            return;
        }

        companiesTbody.innerHTML = comps.map(c => {
            const cCat = cats.find(x => x.id === c.categoryId);
            const catName = cCat ? cCat.name : 'Uncategorized';
            return `
            <tr>
                <td style="font-weight: 500">${escapeHTML(c.name)}</td>
                <td><span class="badge">${escapeHTML(catName)}</span></td>
                <td>${escapeHTML(c.email || '-')}</td>
                <td>${escapeHTML(c.phone || '-')}</td>
                <td class="actions">
                    <button class="btn btn-outline btn-small" onclick="viewCompany('${c.id}')">View</button>
                    <button class="btn btn-outline btn-small btn-danger-outline" onclick="deleteCompany('${c.id}')"><i class="ri-delete-bin-line"></i></button>
                </td>
            </tr>
            `;
        }).join('');
    }

    /** View: Company Details & Contacts **/
    const formContact = document.getElementById('form-contact');
    const contactsTbody = document.getElementById('contacts-table-body');

    formContact.addEventListener('submit', (e) => {
        e.preventDefault();
        const newContact = {
            companyId: document.getElementById('contactCompanyId').value,
            name: document.getElementById('contName').value,
            position: document.getElementById('contPosition').value,
            email: document.getElementById('contEmail').value,
            phone: document.getElementById('contPhone').value
        };
        DB.addContact(newContact);
        closeModal('contact');
        loadCompanyDetails(newContact.companyId);
        updateDashboard();
    });

    window.deleteContact = (id, compId) => {
        if(confirm("Delete this contact?")) {
            DB.deleteContact(id);
            loadCompanyDetails(compId);
            updateDashboard();
        }
    };

    function loadCompanyDetails(id) {
        const comp = DB.getCompany(id);
        if (!comp) return switchView('companies-view');

        const cats = DB.getCategories();
        const cCat = cats.find(x => x.id === comp.categoryId);
        
        document.getElementById('detail-company-name').innerText = comp.name;
        document.getElementById('detail-company-category').innerText = cCat ? cCat.name : 'No Category';
        document.getElementById('detail-company-slug').innerText = comp.slug || '-';
        document.getElementById('detail-company-phone').innerText = comp.phone || '-';
        document.getElementById('detail-company-email').innerText = comp.email || '-';
        document.getElementById('detail-company-address').innerText = comp.address || '-';

        // Render subscription info
        const subDisplay = document.getElementById('subscription-info-display');
        if (comp.subscription && (comp.subscription.start || comp.subscription.end || comp.subscription.users)) {
            subDisplay.style.display = 'block';
            document.getElementById('display-sub-start').innerText = comp.subscription.start || 'Not set';
            document.getElementById('display-sub-end').innerText = comp.subscription.end || 'Not set';
            document.getElementById('display-sub-users').innerText = comp.subscription.users || 'Unlimited';
            document.getElementById('display-sub-trial').style.display = comp.subscription.isTrial ? 'inline-block' : 'none';
        } else {
            subDisplay.style.display = 'none';
        }

        // Render Contacts
        const contacts = DB.getContactsByCompany(id);
        if (contacts.length === 0) {
            contactsTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 32px 0; color: var(--text-muted)">No contacts added yet.</td></tr>`;
        } else {
            contactsTbody.innerHTML = contacts.map(c => `
                <tr>
                    <td style="font-weight: 500">${escapeHTML(c.name)}</td>
                    <td>${escapeHTML(c.position)}</td>
                    <td>
                        <div style="font-size: 0.85rem">
                            <div><i class="ri-mail-line" style="color:var(--text-muted)"></i> ${escapeHTML(c.email || '-')}</div>
                            <div><i class="ri-phone-line" style="color:var(--text-muted)"></i> ${escapeHTML(c.phone || '-')}</div>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-outline btn-small btn-danger-outline" onclick="deleteContact('${c.id}', '${comp.id}')"><i class="ri-delete-bin-line"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        // Render Tickets
        const companyTicketsBody = document.getElementById('company-tickets-table-body');
        if (companyTicketsBody) {
            const tix = DB.getTicketsByCompany(id);
            if (tix.length === 0) {
                companyTicketsBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 32px 0; color: var(--text-muted)">No tickets for this company.</td></tr>`;
            } else {
                companyTicketsBody.innerHTML = tix.map(t => `
                    <tr>
                        <td style="font-weight: 500">${escapeHTML(t.title)} <br> <small style="color:var(--text-muted); font-weight:normal">${escapeHTML(t.desc)}</small></td>
                        <td>${getPriorityBadge(t.priority)}</td>
                        <td>
                            <select onchange="updateTicketStatus('${t.id}', this)" style="padding: 4px; border-radius: 4px; font-size: 0.85em">
                                <option value="Open" ${t.status==='Open'?'selected':''}>Open</option>
                                <option value="In Progress" ${t.status==='In Progress'?'selected':''}>In Progress</option>
                                <option value="Resolved" ${t.status==='Resolved'?'selected':''}>Resolved</option>
                            </select>
                        </td>
                        <td>${t.filename ? `<i class="ri-attachment-2"></i> ${escapeHTML(t.filename)}` : '-'}</td>
                        <td>
                            <button class="btn btn-outline btn-small" onclick="viewTicket('${t.id}')">View</button>
                            <button class="btn btn-outline btn-small btn-danger-outline" onclick="deleteTicket('${t.id}', '${comp.id}')"><i class="ri-delete-bin-line"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    }

    /** View: Tickets & Creation **/
    /** Shared: Auto Email on Ticket Create **/
    async function sendTicketEmail(ticket) {
        const sets = DB.getSettings();
        if (!sets.email_service_id || !sets.email_template_id || !sets.email_public_key || !sets.email_recipients) return;
        const comp = DB.getCompany(ticket.companyId);
        const compName = comp ? comp.name : 'Unknown';
        const recipients = sets.email_recipients.split(',').map(e => e.trim()).filter(Boolean);
        try {
            emailjs.init(sets.email_public_key);
            await Promise.all(recipients.map(to_email =>
                emailjs.send(sets.email_service_id, sets.email_template_id, {
                    to_email,
                    ticket_title: ticket.title,
                    ticket_type: ticket.type || 'Bug',
                    ticket_priority: ticket.priority || 'Medium',
                    ticket_status: ticket.status || 'Open',
                    ticket_desc: ticket.desc,
                    company_name: compName
                })
            ));
            DB.addComment({ ticketId: ticket.id, text: `Auto-email sent to: ${recipients.join(', ')}`, type: 'system' });
        } catch (err) {
            console.warn('Auto email failed:', err.text || err.message);
        }
    }

    const formTicket = document.getElementById('form-ticket');
    formTicket.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('tickFile');
        const filename = fileInput.files.length > 0 ? fileInput.files[0].name : '';
        const newTicket = {
            companyId: document.getElementById('ticketCompanyId').value,
            title: document.getElementById('tickTitle').value,
            desc: document.getElementById('tickDesc').value,
            status: document.getElementById('tickStatus').value,
            priority: document.getElementById('tickPriority') ? document.getElementById('tickPriority').value : 'Medium',
            type: document.getElementById('tickType').value,
            filename: filename
        };
        DB.addTicket(newTicket);
        closeModal('ticket');
        // Re-render
        if (currentCompanyId) loadCompanyDetails(currentCompanyId);
        renderAllTickets();
        updateDashboard();
        // Auto-send email notification
        const saved = DB.getTickets().find(t => t.title === newTicket.title && t.desc === newTicket.desc);
        if (saved) sendTicketEmail(saved);
    });

    window.updateTicketStatus = (id, elm) => {
        DB.updateTicketStatus(id, elm.value);
        if (currentCompanyId) loadCompanyDetails(currentCompanyId);
        updateDashboard(); 
    };

    window.deleteTicket = (id, compId) => {
        if(confirm("Delete this ticket?")) {
            DB.deleteTicket(id);
            if (compId) loadCompanyDetails(compId);
            renderAllTickets();
            updateDashboard();
        }
    };

    function renderAllTickets() {
        const tbody = document.getElementById('tickets-table-body');
        const tickets = DB.getTickets();
        
        if (tickets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 32px 0; color: var(--text-muted)">No tickets created yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = tickets.map(t => {
            const comp = DB.getCompany(t.companyId);
            const compName = comp ? comp.name : 'Unknown';
            return `
            <tr>
                <td style="font-weight: 500">${escapeHTML(t.title)} <br> <small style="color:var(--text-muted); font-weight:normal">${escapeHTML(t.desc)}</small></td>
                <td>${getTypeBadge(t.type)}</td>
                <td><span class="badge" style="background:var(--bg-surface-hover); color:var(--text-main)">${escapeHTML(compName)}</span></td>
                <td>${getPriorityBadge(t.priority)}</td>
                <td>
                    <select onchange="updateTicketStatus('${t.id}', this)" style="padding: 4px; border-radius: 4px; font-size: 0.85em">
                        <option value="Open" ${t.status==='Open'?'selected':''}>Open</option>
                        <option value="In Progress" ${t.status==='In Progress'?'selected':''}>In Progress</option>
                        <option value="Resolved" ${t.status==='Resolved'?'selected':''}>Resolved</option>
                    </select>
                </td>
                <td>${t.filename ? `<i class="ri-attachment-2"></i> ${escapeHTML(t.filename)}` : '-'}</td>
                <td>
                    <button class="btn btn-outline btn-small" onclick="viewTicket('${t.id}')">View</button>
                    <button class="btn btn-outline btn-small btn-danger-outline" onclick="deleteTicket('${t.id}', null)"><i class="ri-delete-bin-line"></i></button>
                </td>
            </tr>
            `;
        }).join('');
    }

    /** Ticket Details & Comments Logic **/
    window.viewTicket = (id) => {
        loadTicketDetails(id);
        
        // Hide other views, show ticket-details
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('ticket-details-view').classList.add('active');
        
        // Remove active from side nav since we're in a deeper view
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    };

    document.getElementById('btn-back-tickets').addEventListener('click', () => {
        // Simple back logic depending on what was active before could be complex, 
        // We'll figure out: if we have a currentCompanyId we might go back to companies OR tickets.
        // For simplicity, always go back to the global tickets list view:
        document.querySelectorAll('.nav-item').forEach(nav => {
            if (nav.dataset.target === 'tickets-view') nav.classList.add('active');
            else nav.classList.remove('active');
        });
        document.querySelectorAll('.view-section').forEach(section => {
            if (section.id === 'tickets-view') section.classList.add('active');
            else section.classList.remove('active');
        });
        renderAllTickets();
    });

    function loadTicketDetails(id) {
        const ticket = DB.getTickets().find(t => t.id === id);
        if (!ticket) return;

        const comp = DB.getCompany(ticket.companyId);
        
        document.getElementById('detail-ticket-title').innerText = ticket.title;
        document.getElementById('detail-ticket-subtitle').innerText = `Reported by ${comp ? comp.name : 'Unknown'}`;
        document.getElementById('detail-ticket-desc').innerText = ticket.desc;
        document.getElementById('detail-ticket-priority').innerHTML = getPriorityBadge(ticket.priority) + ' ' + getTypeBadge(ticket.type);
        document.getElementById('detail-ticket-status').value = ticket.status;
        
        const attachEl = document.getElementById('detail-ticket-attachment');
        if (ticket.filename) {
            attachEl.innerHTML = `<a href="#" style="color:var(--primary); text-decoration:none;"><i class="ri-file-download-line"></i> ${escapeHTML(ticket.filename)}</a>`;
        } else {
            attachEl.innerHTML = '<span style="color:var(--text-muted)">No attachment provided.</span>';
        }

        if (comp) {
            document.getElementById('dt-cl-name').innerHTML = `${escapeHTML(comp.name)} <span class="badge" style="font-size:0.7em; margin-left:4px; margin-top:-2px;">${escapeHTML(comp.slug || '')}</span>`;
            document.getElementById('dt-cl-phone').innerText = comp.phone || 'Not provided';
            document.getElementById('dt-cl-email').innerText = comp.email || 'Not provided';
        } else {
            document.getElementById('dt-cl-name').innerText = 'Unknown Company';
            document.getElementById('dt-cl-phone').innerText = '-';
            document.getElementById('dt-cl-email').innerText = '-';
        }

        const statusSel = document.getElementById('detail-ticket-status');
        statusSel.onchange = (e) => {
            DB.updateTicketStatus(ticket.id, e.target.value);
            DB.addComment({ ticketId: ticket.id, text: `Status changed to ${e.target.value}`, type: 'system' });
            renderComments(ticket.id);
            updateDashboard();
            renderAllTickets();
        };
        
        // Setup Assignee
        const assigneeSel = document.getElementById('detail-ticket-assignee');
        const users = DB.getUsers();
        assigneeSel.innerHTML = `<option value="">Unassigned</option>` + users.map(u => `<option value="${escapeHTML(u.id)}">${escapeHTML(u.name)} (${escapeHTML(u.role)})</option>`).join('');
        assigneeSel.value = ticket.assigneeId || '';
        
        assigneeSel.onchange = (e) => {
            const val = e.target.value;
            DB.updateTicketAssignee(ticket.id, val);
            const userObj = users.find(u => u.id === val);
            const assigneeName = userObj ? userObj.name : 'Unassigned';
            DB.addComment({ ticketId: ticket.id, text: `Assigned to ${assigneeName}`, type: 'system' });
            renderComments(ticket.id);
            updateDashboard();
        };

        const btnEditTicket = document.getElementById('btn-edit-ticket');
        if (btnEditTicket) {
            btnEditTicket.onclick = () => {
                document.getElementById('editTicketId').value = ticket.id;
                document.getElementById('editTickTitle').value = ticket.title;
                document.getElementById('editTickDesc').value = ticket.desc;
                document.getElementById('editTickPriority').value = ticket.priority || 'Medium';
                document.getElementById('editTickType').value = ticket.type || 'Bug';
                const mo = document.getElementById('modal-edit-ticket');
                if (mo) mo.classList.add('active');
            };
        }

        const btnSendEmail = document.getElementById('btn-send-email');
        if (btnSendEmail) {
            btnSendEmail.onclick = async () => {
                const sets = DB.getSettings();
                if (!sets.email_service_id || !sets.email_template_id || !sets.email_public_key || !sets.email_recipients) {
                    alert('Please configure Email Notifications in Settings first.');
                    return;
                }
                btnSendEmail.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Sending...`;
                btnSendEmail.disabled = true;
                try {
                    await sendTicketEmail(ticket);
                    renderComments(ticket.id);
                    alert(`✅ Email sent successfully!`);
                } catch (err) {
                    alert('Email Error: ' + (err.text || err.message || 'Unknown error'));
                } finally {
                    btnSendEmail.innerHTML = `<i class="ri-mail-send-line"></i> Send Email`;
                    btnSendEmail.disabled = false;
                }
            };
        }

        const btnPush = document.getElementById('btn-push-github');
        const btnView = document.getElementById('btn-view-github');
        
        if (btnPush && btnView) {
            if (ticket.githubUrl) {
                btnPush.style.display = 'none';
                btnView.href = ticket.githubUrl;
                btnView.style.display = 'inline-flex';
            } else {
                btnView.style.display = 'none';
                btnPush.style.display = 'inline-flex';
                
                btnPush.onclick = async () => {
                    const sets = DB.getSettings();
                    if (!sets.github_repo || !sets.github_token) {
                        alert("Please configure GitHub integration in Settings first.");
                        return;
                    }
                    
                    btnPush.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Pushing...`;
                    btnPush.disabled = true;
                    
                    try {
                        const compName = comp ? comp.name : 'Unknown';
                        const cCat = DB.getCategories().find(x => x.id === (comp ? comp.categoryId : null));
                        
                        const labels = [];
                        if (ticket.priority) labels.push(`Priority: ${ticket.priority}`);
                        else labels.push(`Priority: Medium`);
                        if (ticket.type) labels.push(`Type: ${ticket.type}`);
                        if (cCat && cCat.name) labels.push(`Category: ${cCat.name}`);

                        const payload = {
                            title: `[CS] ${ticket.title}`,
                            body: `**From Customer Support Portal**\n**Company:** ${compName}\n**Priority:** ${ticket.priority || 'Medium'}\n\n**Description:**\n${ticket.desc}`,
                            labels: labels
                        };
                        
                        const response = await fetch(`https://api.github.com/repos/${sets.github_repo}/issues`, {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/vnd.github.v3+json',
                                'Authorization': `token ${sets.github_token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        });
                        
                        if (!response.ok) {
                            const err = await response.json();
                            throw new Error(err.message || 'Error communicating with GitHub');
                        }
                        
                        const data = await response.json();
                        
                        DB.updateTicketDetails(ticket.id, { ...ticket, githubUrl: data.html_url });
                        DB.addComment({ ticketId: ticket.id, text: `Escalated to GitHub Issue #${data.number}`, type: 'system' });
                        
                        loadTicketDetails(ticket.id);
                    } catch (err) {
                        alert('GitHub Error: ' + err.message);
                        btnPush.innerHTML = `<i class="ri-github-fill"></i> Push to GitHub`;
                        btnPush.disabled = false;
                    }
                };
            }
        }

        document.getElementById('commentTicketId').value = ticket.id;
        renderComments(ticket.id);
    }

    function renderComments(ticketId) {
        const list = document.getElementById('comments-list');
        const comments = DB.getComments(ticketId);
        
        if (comments.length === 0) {
            list.innerHTML = `<div style="text-align:center; color:var(--text-muted); margin-top:24px;">No timeline activity yet.</div>`;
            return;
        }

        list.innerHTML = comments.map(c => {
            const date = new Date(c.createdAt).toLocaleString();
            const isSystem = c.type === 'system';
            return `
            <div class="comment-bubble" style="margin-bottom:12px; ${isSystem ? 'background: #fffbeb; border-color: #fde68a;' : ''}">
                <div class="time">${isSystem ? '<i class="ri-robot-2-line"></i> System Updates' : '<i class="ri-user-smile-line"></i> Support Agent'} &bull; ${date}</div>
                <div class="text" style="${isSystem ? 'color: #b45309; font-style:italic;' : ''}">${escapeHTML(c.text)}</div>
            </div>
            `;
        }).join('');
        list.scrollTop = list.scrollHeight;
    }

    const formComment = document.getElementById('form-comment');
    if (formComment) {
        formComment.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('commentText');
            const tId = document.getElementById('commentTicketId').value;
            if (input.value.trim() && tId) {
                DB.addComment({ ticketId: tId, text: input.value.trim(), type: 'user' });
                input.value = '';
                renderComments(tId);
            }
        });
    }

    const formEditTicket = document.getElementById('form-edit-ticket');
    if (formEditTicket) {
        formEditTicket.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('editTicketId').value;
            const updates = {
                title: document.getElementById('editTickTitle').value,
                desc: document.getElementById('editTickDesc').value,
                priority: document.getElementById('editTickPriority').value,
                type: document.getElementById('editTickType').value
            };
            DB.updateTicketDetails(id, updates);
            DB.addComment({ ticketId: id, text: `Ticket details updated`, type: 'system' });
            
            const mo = document.getElementById('modal-edit-ticket');
            if (mo) mo.classList.remove('active');
            
            // Re-render
            const ticket = DB.getTickets().find(t => t.id === id);
            if (ticket) {
                document.getElementById('detail-ticket-title').innerText = ticket.title;
                document.getElementById('detail-ticket-desc').innerText = ticket.desc;
                document.getElementById('detail-ticket-priority').innerHTML = getPriorityBadge(ticket.priority) + ' ' + getTypeBadge(ticket.type);
                renderComments(id);
            }
            renderAllTickets();
        });
    }

    /** View: Team **/
    const formUser = document.getElementById('form-user');
    if (formUser) {
        formUser.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUser = {
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                password: document.getElementById('userPassword').value,
                role: document.getElementById('userRole').value
            };
            DB.addUser(newUser);
            closeModal('user');
            document.getElementById('form-user').reset();
            renderTeamList();
            updateDashboard();
        });
    }

    const btnAddUser = document.getElementById('btn-add-user');
    if (btnAddUser) {
        btnAddUser.addEventListener('click', () => {
            document.getElementById('form-user').reset();
            openModal('user');
        });
    }

    window.deleteUser = (id) => {
        if(confirm("Delete this user?")) {
            DB.deleteUser(id);
            renderTeamList();
            updateDashboard();
        }
    };

    function renderTeamList() {
        const tbody = document.getElementById('team-table-body');
        if (!tbody) return;
        const users = DB.getUsers();
        
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 32px 0; color: var(--text-muted)">No team members added yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td style="font-weight: 500">${escapeHTML(u.name)}</td>
                <td>${escapeHTML(u.email)}</td>
                <td><span class="badge" style="background:var(--bg-surface-hover); color:var(--text-main)">${escapeHTML(u.role)}</span></td>
                <td>
                    ${u.role !== 'Admin' || users.length > 1 ? `<button class="btn btn-outline btn-small btn-danger-outline" onclick="deleteUser('${u.id}')"><i class="ri-delete-bin-line"></i></button>` : `<span class="badge">Primary</span>`}
                </td>
            </tr>
        `).join('');
    }

    /** View: Settings & Integrations **/
    const formGithub = document.getElementById('form-github-settings');
    if (formGithub) {
        const sets = DB.getSettings();
        if (sets.github_repo) document.getElementById('githubRepo').value = sets.github_repo;
        if (sets.github_token) document.getElementById('githubToken').value = sets.github_token;
        
        formGithub.addEventListener('submit', (e) => {
            e.preventDefault();
            const newSets = {
                ...DB.getSettings(),
                github_repo: document.getElementById('githubRepo').value.trim(),
                github_token: document.getElementById('githubToken').value.trim()
            };
            DB.setSettings(newSets);
            const msg = document.getElementById('github-save-msg');
            msg.style.display = 'block';
            setTimeout(() => msg.style.display = 'none', 3000);
        });
    }

    const formEmail = document.getElementById('form-email-settings');
    if (formEmail) {
        const sets = DB.getSettings();
        if (sets.email_service_id) document.getElementById('emailServiceId').value = sets.email_service_id;
        if (sets.email_template_id) document.getElementById('emailTemplateId').value = sets.email_template_id;
        if (sets.email_public_key) document.getElementById('emailPublicKey').value = sets.email_public_key;
        if (sets.email_recipients) document.getElementById('emailRecipients').value = sets.email_recipients;

        formEmail.addEventListener('submit', (e) => {
            e.preventDefault();
            const newSets = {
                ...DB.getSettings(),
                email_service_id: document.getElementById('emailServiceId').value.trim(),
                email_template_id: document.getElementById('emailTemplateId').value.trim(),
                email_public_key: document.getElementById('emailPublicKey').value.trim(),
                email_recipients: document.getElementById('emailRecipients').value.trim()
            };
            DB.setSettings(newSets);
            const msg = document.getElementById('email-save-msg');
            msg.style.display = 'block';
            setTimeout(() => msg.style.display = 'none', 3000);
        });
    }

    // Helper: Priority Badge
    function getPriorityBadge(p) {
        const lower = p ? p.toLowerCase() : 'low';
        return `<span class="badge badge-${escapeHTML(lower)}">${escapeHTML(p || 'Low')}</span>`;
    }

    // Helper: Type Badge
    function getTypeBadge(t) {
        if (!t) return `<span class="badge badge-bug">🐛 Bug</span>`;
        if (t === 'New Feature') return `<span class="badge badge-feature">✨ New Feature</span>`;
        return `<span class="badge badge-bug">🐛 Bug</span>`;
    }

    // Helper: Escape HTML to prevent XSS
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // Init App
    if (checkAuth()) {
        updateDashboard();
    }
});
