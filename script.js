const STORAGE_KEYS = {
    APP_SETTINGS: 'cs_portal_settings'
};

// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase project details
const SUPABASE_URL = 'https://cpyjekzfuxowbkfzagbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_z0P-AN1c-s7yBxUNC6BEsQ_oRU6MTC0';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Data Access Object (Rewritten for Supabase Auth)
const DB = {
    // Auth & Identity
    async signIn(email, password) {
        return await supabaseClient.auth.signInWithPassword({ email, password });
    },
    async signOut() {
        return await supabaseClient.auth.signOut();
    },
    async getSession() {
        const { data } = await supabaseClient.auth.getSession();
        return data.session;
    },
    async getUserProfile(id) {
        const { data, error } = await supabaseClient.from('profiles').select('*').eq('id', id).single();
        if (error) console.error('Error fetching profile:', error);
        return data;
    },

    // Categories
    async getCategories() {
        const { data, error } = await supabaseClient.from('categories').select('*').order('name');
        if (error) console.error('Error fetching categories:', error);
        return data || [];
    },
    async addCategory(name) {
        const { data, error } = await supabaseClient.from('categories').insert([{ name }]).select();
        if (error) console.error('Error adding category:', error);
        return data ? data[0] : null;
    },
    async deleteCategory(id) {
        const { error } = await supabaseClient.from('categories').delete().eq('id', id);
        if (error) console.error('Error deleting category:', error);
    },

    // Companies
    async getCompanies() {
        const { data, error } = await supabaseClient.from('companies').select('*').order('name');
        if (error) console.error('Error fetching companies:', error);
        return data || [];
    },
    async getCompany(id) {
        const { data, error } = await supabaseClient.from('companies').select('*').eq('id', id).single();
        if (error) console.error('Error fetching company:', error);
        return data;
    },
    async addCompany(company) {
        const payload = {
            name: company.name,
            slug: company.slug,
            category_id: company.categoryId,
            email: company.email,
            phone: company.phone,
            address: company.address,
            sub_start: company.sub_start || company.subscription?.start,
            sub_end: company.sub_end || company.subscription?.end,
            sub_users: company.sub_users || company.subscription?.users,
            sub_is_trial: company.sub_is_trial || company.subscription?.isTrial
        };
        const { data, error } = await supabaseClient.from('companies').insert([payload]).select();
        if (error) console.error('Error adding company:', error);
        return data ? data[0] : null;
    },
    async updateCompany(id, company) {
        const payload = {
            name: company.name,
            slug: company.slug,
            category_id: company.categoryId,
            email: company.email,
            phone: company.phone,
            address: company.address,
            sub_start: company.sub_start || company.subscription?.start,
            sub_end: company.sub_end || company.subscription?.end,
            sub_users: company.sub_users || company.subscription?.users,
            sub_is_trial: company.sub_is_trial || company.subscription?.isTrial
        };
        const { error } = await supabaseClient.from('companies').update(payload).eq('id', id);
        if (error) console.error('Error updating company:', error);
    },
    async deleteCompany(id) {
        const { error } = await supabaseClient.from('companies').delete().eq('id', id);
        if (error) console.error('Error deleting company:', error);
    },

    // Contacts
    async getContactsByCompany(companyId) {
        const { data, error } = await supabaseClient.from('contacts').select('*').eq('company_id', companyId);
        if (error) console.error('Error fetching contacts:', error);
        return data || [];
    },
    async addContact(contact) {
        const payload = {
            company_id: contact.company_id || contact.companyId,
            name: contact.name,
            position: contact.position,
            email: contact.email,
            phone: contact.phone
        };
        const { data, error } = await supabaseClient.from('contacts').insert([payload]).select();
        if (error) console.error('Error adding contact:', error);
        return data ? data[0] : null;
    },
    async deleteContact(id) {
        const { error } = await supabaseClient.from('contacts').delete().eq('id', id);
        if (error) console.error('Error deleting contact:', error);
    },

    // Tickets
    async getTickets() {
        const { data, error } = await supabaseClient.from('tickets').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching tickets:', error);
        return data || [];
    },
    async getTicketsByCompany(companyId) {
        const { data, error } = await supabaseClient.from('tickets').select('*').eq('company_id', companyId);
        if (error) console.error('Error fetching tickets by company:', error);
        return data || [];
    },
    async addTicket(ticket) {
        const payload = {
            company_id: ticket.company_id || ticket.companyId,
            title: ticket.title,
            description: ticket.description || ticket.desc,
            status: ticket.status,
            priority: ticket.priority,
            type: ticket.type,
            filename: ticket.filename
        };
        const { data, error } = await supabaseClient.from('tickets').insert([payload]).select();
        if (error) console.error('Error adding ticket:', error);
        return data ? data[0] : null;
    },
    async updateTicketStatus(id, status) {
        const { error } = await supabaseClient.from('tickets').update({ status }).eq('id', id);
        if (error) console.error('Error updating ticket status:', error);
    },
    async updateTicketDetails(id, updates) {
        const payload = {
            title: updates.title,
            description: updates.description || updates.desc,
            priority: updates.priority,
            type: updates.type,
            github_url: updates.github_url || updates.githubUrl
        };
        const { error } = await supabaseClient.from('tickets').update(payload).eq('id', id);
        if (error) console.error('Error updating ticket details:', error);
    },
    async updateTicketAssignee(id, assigneeId) {
        const { error } = await supabaseClient.from('tickets').update({ assignee_id: assigneeId }).eq('id', id);
        if (error) console.error('Error updating ticket assignee:', error);
    },
    async deleteTicket(id) {
        const { error } = await supabaseClient.from('tickets').delete().eq('id', id);
        if (error) console.error('Error deleting ticket:', error);
    },

    // Comments
    async getComments(ticketId) {
        const { data, error } = await supabaseClient.from('comments').select('*').eq('ticket_id', ticketId).order('created_at');
        if (error) console.error('Error fetching comments:', error);
        return data || [];
    },
    async addComment(comment) {
        const payload = {
            ticket_id: comment.ticketId,
            text: comment.text,
            type: comment.type
        };
        const { data, error } = await supabaseClient.from('comments').insert([payload]).select();
        if (error) console.error('Error adding comment:', error);
        return data ? data[0] : null;
    },

    // Users (Profiles)
    async getUsers() {
        const { data, error } = await supabaseClient.from('profiles').select('*').order('full_name');
        if (error) console.error('Error fetching profiles:', error);
        return data || [];
    },
    async deleteUser(id) {
        // Note: Real user deletion should happen via Supabase Admin API or Auth management dash
        const { error } = await supabaseClient.from('profiles').delete().eq('id', id);
        if (error) console.error('Error deleting profile:', error);
    },

    // Settings
    getSettings() { 
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.APP_SETTINGS) || '{}');
    },
    setSettings(settings) { 
        localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings)); 
    },
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
    async function checkAuth() {
        const loginLayout = document.getElementById('login-layout');
        const appLayout = document.getElementById('app-layout');
        
        const session = await DB.getSession();
        
        if (!session) {
            loginLayout.style.display = 'flex';
            appLayout.style.display = 'none';
            return false;
        }

        const profile = await DB.getUserProfile(session.user.id);
        if (!profile) {
            // Profile not created yet (might happen if trigger fails or user is old)
            // For now, treat as no auth or redirect to profile setup
            console.error('No profile found for authenticated user');
            await DB.signOut();
            loginLayout.style.display = 'flex';
            appLayout.style.display = 'none';
            return false;
        }

        document.getElementById('current-user-name').innerText = profile.full_name || session.user.email;
        document.getElementById('current-user-role').innerText = profile.role;

        navItems.forEach(nav => {
            if (nav.dataset.target === 'settings-view' || nav.dataset.target === 'team-view') {
                nav.style.display = profile.role === 'Admin' ? 'flex' : 'none';
            }
        });

        loginLayout.style.display = 'none';
        appLayout.style.display = 'flex';
        return true;
    }

    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const errorBlock = document.getElementById('login-error');
            
            const { data, error } = await DB.signIn(email, password);
            
            if (error) {
                errorBlock.innerText = error.message;
                errorBlock.style.display = 'block';
            } else {
                errorBlock.style.display = 'none';
                formLogin.reset();
                if (await checkAuth()) switchView('dashboard-view');
            }
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await DB.signOut();
            await checkAuth();
        });
    }

    async function switchView(targetId) {
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
        if (targetId === 'dashboard-view') await updateDashboard();
        if (targetId === 'companies-view') await renderCompaniesList();
        if (targetId === 'settings-view') await renderCategoriesList();
        if (targetId === 'tickets-view') await renderAllTickets();
        if (targetId === 'team-view') await renderTeamList();
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
    document.getElementById('btn-add-company').addEventListener('click', async () => {
        await populateCategoryDropdown();
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
    async function updateDashboard() {
        const comps = await DB.getCompanies();
        const tix = await DB.getTickets();
        // For total contacts, we'd need a separate fetch or a complex query, 
        // for now let's just count from fetched companies if we had contacts locally 
        // but we'll leave it as a placeholder or fetch separately
        document.getElementById('stat-companies').innerText = comps.length;
        document.getElementById('stat-tickets').innerText = tix.length;
    }

    /** View: Settings (Categories) **/
    const formCategory = document.getElementById('form-category');
    const categoriesList = document.getElementById('categories-list');

    formCategory.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('categoryName');
        const val = input.value.trim();
        if (val) {
            await DB.addCategory(val);
            input.value = '';
            await renderCategoriesList();
        }
    });

    window.deleteCategory = async (id) => {
        if(confirm("Are you sure?")) {
            await DB.deleteCategory(id);
            await renderCategoriesList();
        }
    };

    async function renderCategoriesList() {
        const cats = await DB.getCategories();
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

    formCompany.addEventListener('submit', async (e) => {
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
            await DB.updateCompany(id, companyData);
        } else {
            await DB.addCompany(companyData);
        }

        closeModal('company');
        await renderCompaniesList();
        await updateDashboard();
        if (id && currentCompanyId === id) await loadCompanyDetails(id);
    });

    // We expose global functions for inline onclick handlers inside generated innerHTML
    window.viewCompany = async (id) => {
        currentCompanyId = id;
        await loadCompanyDetails(id);
        await switchView('company-details-view');
        // Unset any nav active highlight since this is a sub-page
        navItems.forEach(nav => nav.classList.remove('active'));
    };

    window.deleteCompany = async (id) => {
        if(confirm("Delete company and all its contacts?")) {
            await DB.deleteCompany(id);
            await renderCompaniesList();
            await updateDashboard();
        }
    };

    window.editCompany = async (id) => {
        const comp = await DB.getCompany(id);
        if (!comp) return;

        await populateCategoryDropdown();
        document.getElementById('compId').value = comp.id;
        document.getElementById('compName').value = comp.name;
        document.getElementById('compSlug').value = comp.slug || '';
        document.getElementById('compCategory').value = comp.category_id || '';
        document.getElementById('compEmail').value = comp.email || '';
        document.getElementById('compPhone').value = comp.phone || '';
        document.getElementById('compAddress').value = comp.address || '';

        // Subscription fields
        document.getElementById('compSubStart').value = comp.sub_start || '';
        document.getElementById('compSubEnd').value = comp.sub_end || '';
        document.getElementById('compSubUsers').value = comp.sub_users || '';
        document.getElementById('compSubIsTrial').checked = comp.sub_is_trial || false;

        document.getElementById('subscription-fields').style.display = 'block';
        document.getElementById('modal-company-title').innerText = 'Edit Company';
        document.getElementById('btn-save-company').innerText = 'Update Company';
        openModal('company');
    };

    async function populateCategoryDropdown() {
        const sel = document.getElementById('compCategory');
        const cats = await DB.getCategories();
        sel.innerHTML = `<option value="">Select a category</option> ` + 
            cats.map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join('');
    }

    async function renderCompaniesList() {
        const comps = await DB.getCompanies();
        const cats = await DB.getCategories();
        
        if (comps.length === 0) {
            companiesTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 32px 0; color: var(--text-muted)">No companies added yet.</td></tr>`;
            return;
        }

        companiesTbody.innerHTML = comps.map(c => {
            const cCat = cats.find(x => x.id === c.category_id);
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

    formContact.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newContact = {
            companyId: document.getElementById('contactCompanyId').value,
            name: document.getElementById('contName').value,
            position: document.getElementById('contPosition').value,
            email: document.getElementById('contEmail').value,
            phone: document.getElementById('contPhone').value
        };
        await DB.addContact(newContact);
        closeModal('contact');
        await loadCompanyDetails(newContact.companyId);
        await updateDashboard();
    });

    window.deleteContact = async (id, compId) => {
        if(confirm("Delete this contact?")) {
            await DB.deleteContact(id);
            await loadCompanyDetails(compId);
            await updateDashboard();
        }
    };

    async function loadCompanyDetails(id) {
        const comp = await DB.getCompany(id);
        if (!comp) return switchView('companies-view');

        const cats = await DB.getCategories();
        const cCat = cats.find(x => x.id === comp.category_id);
        
        document.getElementById('detail-company-name').innerText = comp.name;
        document.getElementById('detail-company-category').innerText = cCat ? cCat.name : 'No Category';
        document.getElementById('detail-company-slug').innerText = comp.slug || '-';
        document.getElementById('detail-company-phone').innerText = comp.phone || '-';
        document.getElementById('detail-company-email').innerText = comp.email || '-';
        document.getElementById('detail-company-address').innerText = comp.address || '-';

        // Render subscription info
        const subDisplay = document.getElementById('subscription-info-display');
        if (comp.sub_start || comp.sub_end || comp.sub_users) {
            subDisplay.style.display = 'block';
            document.getElementById('display-sub-start').innerText = comp.sub_start || 'Not set';
            document.getElementById('display-sub-end').innerText = comp.sub_end || 'Not set';
            document.getElementById('display-sub-users').innerText = comp.sub_users || 'Unlimited';
            document.getElementById('display-sub-trial').style.display = comp.sub_is_trial ? 'inline-block' : 'none';
        } else {
            subDisplay.style.display = 'none';
        }

        // Render Contacts
        const contacts = await DB.getContactsByCompany(id);
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
            const tix = await DB.getTicketsByCompany(id);
            if (tix.length === 0) {
                companyTicketsBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 32px 0; color: var(--text-muted)">No tickets for this company.</td></tr>`;
            } else {
                companyTicketsBody.innerHTML = tix.map(t => `
                    <tr>
                        <td style="font-weight: 500">${escapeHTML(t.title)} <br> <small style="color:var(--text-muted); font-weight:normal">${escapeHTML(t.description)}</small></td>
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
        const saved = await DB.addTicket(newTicket);
        closeModal('ticket');
        // Re-render
        if (currentCompanyId) await loadCompanyDetails(currentCompanyId);
        await renderAllTickets();
        await updateDashboard();
        // Auto-send email notification
        if (saved) await sendTicketEmail(saved);
    });

    window.updateTicketStatus = async (id, elm) => {
        await DB.updateTicketStatus(id, elm.value);
        if (currentCompanyId) await loadCompanyDetails(currentCompanyId);
        await updateDashboard(); 
    };

    window.deleteTicket = async (id, compId) => {
        if(confirm("Delete this ticket?")) {
            await DB.deleteTicket(id);
            if (compId) await loadCompanyDetails(compId);
            await renderAllTickets();
            await updateDashboard();
        }
    };

    async function renderAllTickets() {
        const tbody = document.getElementById('tickets-table-body');
        const tickets = await DB.getTickets();
        const companies = await DB.getCompanies();
        
        if (tickets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 32px 0; color: var(--text-muted)">No tickets created yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = tickets.map(t => {
            const comp = companies.find(c => c.id === t.company_id);
            const compName = comp ? comp.name : 'Unknown';
            return `
            <tr>
                <td style="font-weight: 500">${escapeHTML(t.title)} <br> <small style="color:var(--text-muted); font-weight:normal">${escapeHTML(t.description)}</small></td>
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
    window.viewTicket = async (id) => {
        await loadTicketDetails(id);
        
        // Hide other views, show ticket-details
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('ticket-details-view').classList.add('active');
        
        // Remove active from side nav since we're in a deeper view
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    };

    document.getElementById('btn-back-tickets').addEventListener('click', async () => {
        document.querySelectorAll('.nav-item').forEach(nav => {
            if (nav.dataset.target === 'tickets-view') nav.classList.add('active');
            else nav.classList.remove('active');
        });
        document.querySelectorAll('.view-section').forEach(section => {
            if (section.id === 'tickets-view') section.classList.add('active');
            else section.classList.remove('active');
        });
        await renderAllTickets();
    });

    async function loadTicketDetails(id) {
        const tickets = await DB.getTickets();
        const ticket = tickets.find(t => t.id === id);
        if (!ticket) return;

        const comp = await DB.getCompany(ticket.company_id);
        
        document.getElementById('detail-ticket-title').innerText = ticket.title;
        document.getElementById('detail-ticket-subtitle').innerText = `Reported by ${comp ? comp.name : 'Unknown'}`;
        document.getElementById('detail-ticket-desc').innerText = ticket.description;
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
        statusSel.onchange = async (e) => {
            await DB.updateTicketStatus(ticket.id, e.target.value);
            await DB.addComment({ ticketId: ticket.id, text: `Status changed to ${e.target.value}`, type: 'system' });
            await renderComments(ticket.id);
            await updateDashboard();
            await renderAllTickets();
        };
        
        // Setup Assignee
        const assigneeSel = document.getElementById('detail-ticket-assignee');
        const users = await DB.getUsers();
        assigneeSel.innerHTML = `<option value="">Unassigned</option>` + users.map(u => `<option value="${escapeHTML(u.id)}">${escapeHTML(u.full_name || u.email)} (${escapeHTML(u.role)})</option>`).join('');
        assigneeSel.value = ticket.assignee_id || '';
        
        assigneeSel.onchange = async (e) => {
            const val = e.target.value;
            await DB.updateTicketAssignee(ticket.id, val);
            const userObj = users.find(u => u.id === val);
            const assigneeName = userObj ? userObj.name : 'Unassigned';
            await DB.addComment({ ticketId: ticket.id, text: `Assigned to ${assigneeName}`, type: 'system' });
            await renderComments(ticket.id);
            await updateDashboard();
        };

        const btnEditTicket = document.getElementById('btn-edit-ticket');
        if (btnEditTicket) {
            btnEditTicket.onclick = () => {
                document.getElementById('editTicketId').value = ticket.id;
                document.getElementById('editTickTitle').value = ticket.title;
                document.getElementById('editTickDesc').value = ticket.description;
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
                    await renderComments(ticket.id);
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
            if (ticket.github_url) {
                btnPush.style.display = 'none';
                btnView.href = ticket.github_url;
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
                        const cats = await DB.getCategories();
                        const cCat = cats.find(x => x.id === (comp ? comp.category_id : null));
                        
                        const labels = [];
                        if (ticket.priority) labels.push(`Priority: ${ticket.priority}`);
                        else labels.push(`Priority: Medium`);
                        if (ticket.type) labels.push(`Type: ${ticket.type}`);
                        if (cCat && cCat.name) labels.push(`Category: ${cCat.name}`);

                        const payload = {
                            title: `[CS] ${ticket.title}`,
                            body: `**From Customer Support Portal**\n**Company:** ${compName}\n**Priority:** ${ticket.priority || 'Medium'}\n\n**Description:**\n${ticket.description}`,
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
                        
                        await DB.updateTicketDetails(ticket.id, { ...ticket, githubUrl: data.html_url });
                        await DB.addComment({ ticketId: ticket.id, text: `Escalated to GitHub Issue #${data.number}`, type: 'system' });
                        
                        await loadTicketDetails(ticket.id);
                    } catch (err) {
                        alert('GitHub Error: ' + err.message);
                        btnPush.innerHTML = `<i class="ri-github-fill"></i> Push to GitHub`;
                        btnPush.disabled = false;
                    }
                };
            }
        }

        document.getElementById('commentTicketId').value = ticket.id;
        await renderComments(ticket.id);
    }

    async function renderComments(ticketId) {
        const list = document.getElementById('comments-list');
        const comments = await DB.getComments(ticketId);
        
        if (comments.length === 0) {
            list.innerHTML = `<div style="text-align:center; color:var(--text-muted); margin-top:24px;">No timeline activity yet.</div>`;
            return;
        }

        list.innerHTML = comments.map(c => {
            const date = new Date(c.created_at || c.createdAt).toLocaleString();
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
        formComment.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('commentText');
            const tId = document.getElementById('commentTicketId').value;
            if (input.value.trim() && tId) {
                await DB.addComment({ ticketId: tId, text: input.value.trim(), type: 'user' });
                input.value = '';
                await renderComments(tId);
            }
        });
    }

    const formEditTicket = document.getElementById('form-edit-ticket');
    if (formEditTicket) {
        formEditTicket.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editTicketId').value;
            const updates = {
                title: document.getElementById('editTickTitle').value,
                desc: document.getElementById('editTickDesc').value,
                priority: document.getElementById('editTickPriority').value,
                type: document.getElementById('editTickType').value
            };
            await DB.updateTicketDetails(id, updates);
            await DB.addComment({ ticketId: id, text: `Ticket details updated`, type: 'system' });
            
            const mo = document.getElementById('modal-edit-ticket');
            if (mo) mo.classList.remove('active');
            
            // Re-render
            const tickets = await DB.getTickets();
            const ticket = tickets.find(t => t.id === id);
            if (ticket) {
                document.getElementById('detail-ticket-title').innerText = ticket.title;
                document.getElementById('detail-ticket-desc').innerText = ticket.description;
                document.getElementById('detail-ticket-priority').innerHTML = getPriorityBadge(ticket.priority) + ' ' + getTypeBadge(ticket.type);
                await renderComments(id);
            }
            await renderAllTickets();
        });
    }

    /** View: Team **/
    const formUser = document.getElementById('form-user');
    if (formUser) {
        formUser.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newUser = {
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                password: document.getElementById('userPassword').value,
                role: document.getElementById('userRole').value
            };
            await DB.addUser(newUser);
            closeModal('user');
            document.getElementById('form-user').reset();
            await renderTeamList();
            await updateDashboard();
        });
    }

    const btnAddUser = document.getElementById('btn-add-user');
    if (btnAddUser) {
        btnAddUser.addEventListener('click', () => {
            document.getElementById('form-user').reset();
            openModal('user');
        });
    }

    window.deleteUser = async (id) => {
        if(confirm("Delete this user?")) {
            await DB.deleteUser(id);
            await renderTeamList();
            await updateDashboard();
        }
    };

    async function renderTeamList() {
        const tbody = document.getElementById('team-table-body');
        if (!tbody) return;
        const users = await DB.getUsers();
        
        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 32px 0; color: var(--text-muted)">No team members added yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td style="font-weight: 500">${escapeHTML(u.full_name || 'No Name')}</td>
                <td>${escapeHTML(u.email || '-')}</td>
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
    (async () => {
        if (await checkAuth()) {
            await updateDashboard();
        }
    })();
});
