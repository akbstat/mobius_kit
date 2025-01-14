import { Form, Visit, Binding, RenderData, } from "../../../api/reflector/reflector";

export enum EventMode {
    VISIT = "Visit",
    FORM = "Forms",
}

export class Event {
    form: Map<number, Form>
    visit: Map<number, Visit>
    binding: Map<number, Set<number>>
    mode: EventMode
    runningId: number
    nextFormOrder: number
    nextVisitOrder: number
    constructor(form: Form[], visit: Visit[], binding: Binding[], mode: EventMode) {
        this.runningId = -1;
        this.form = new Map(form.map(f => [f.id, f]));
        this.visit = new Map(visit.map(v => {
            if (v.name === "Running Records") {
                this.runningId = v.id;
            }
            return [v.id, v];
        }));
        this.binding = new Map(binding.map(b => [b.parent, new Set(b.children)]));
        this.mode = mode;
        this.nextFormOrder = form.length;
        this.nextVisitOrder = visit.length;
    }

    addForm(newForm: { name: string, page: number }) {
        const id = this.nextFormOrder;
        const order = this.nextFormOrder;
        const { name, page } = newForm;
        this.form.set(id, { id, name, page, order });
        this.nextFormOrder += 1;
    }

    addVisit(newVisit: { name: string, running: boolean }) {
        const id = this.nextVisitOrder;
        const order = this.nextVisitOrder;
        let { name, running } = newVisit;
        if (running) {
            this.runningId = id;
            name = "Running Records";
        }
        this.visit.set(id, { id, name, order });
        this.nextVisitOrder += 1;
    }

    moveFormToRunning(id: number) {
        // will not effect in form mode
        if (this.mode === EventMode.VISIT) {
            return;
        }
        if (this.runningId < 0) {
            this.addVisit({ name: "Running Records", running: true });
            this.runningId = this.nextVisitOrder - 1;
        }
        this.binding.set(id, new Set([this.runningId]));
    }

    moveVisitToRunning(id: number) {
        // will not effect in form mode
        if (this.mode === EventMode.FORM) {
            return;
        }
        // will not effect when id equals to runningId
        if (id === this.runningId) {
            return;
        }
        if (this.runningId < 0) {
            this.addVisit({ name: "Running Records", running: true });
            this.runningId = this.nextVisitOrder - 1;
        }
        const children = this.binding.get(id);
        let runningChildren = this.binding.get(this.runningId);
        if (!runningChildren) {
            runningChildren = new Set();
        }
        if (children) {
            children.forEach(id => {
                this.removeFormFromOtherVisit(id);
                if (runningChildren) {
                    runningChildren.add(id);
                }
            })
        }
        this.binding.set(this.runningId, runningChildren);
        this.removeItem(id);
    }

    /**
     * remove form from other visit in bindings except running records
     * @param id form id
     * @returns 
     */
    removeFormFromOtherVisit(id: number) {
        if (this.mode === EventMode.FORM) {
            return;
        }
        for (const [visit, forms] of this.binding.entries()) {
            if (visit !== this.runningId) {
                forms.delete(id);
            }
        }
    }

    swapFormToTop(target: number) {
        const forms = Array.from(this.form.values()).map(f => f.order).sort((x, y) => x - y);
        if (forms.length < 1) {
            return;
        }
        const form = this.form.get(target);
        if (form) {
            form.order = forms[0] - 1;
            this.form.set(target, form);
        }
    }

    updateForm(form: Form) {
        const id = form.id;
        this.form.set(id, form);
    }

    updateVisit(visit: Visit) {
        const id = visit.id;
        this.visit.set(id, visit);
    }

    removeItem(id: number) {
        if (this.mode === EventMode.FORM) {
            this.form.delete(id);
        } else {
            this.visit.delete(id);
        }
        this.binding.delete(id);
    }

    sortFormByPage() {
        this.form = new Map(Array.from(this.form.values()).sort((x, y) => x.page - y.page).map((f, index) => {
            f.order = index;
            return f;
        }).map(f => [f.id, f]));
    }

    swapItem(fromId: number, toId: number) {
        if (this.mode === EventMode.FORM) {
            this.swapForm(fromId, toId);
        } else {
            this.swapVisit(fromId, toId);
        }
        const from = this.binding.get(fromId);
        const to = this.binding.get(toId);
        if (from && to) {
            this.binding.set(fromId, to);
            this.binding.set(toId, from);
        }
    }

    swapForm(fromId: number, toId: number) {
        const from = this.form.get(fromId);
        const to = this.form.get(toId);
        if (from && to) {
            const fromOrder = from.order;
            const toOrder = to.order;
            from.order = toOrder;
            to.order = fromOrder;
            this.form.set(from.id, from);
            this.form.set(to.id, to);
        }
        this.swapBinding(fromId, toId);
    }

    swapVisit(fromId: number, toId: number) {
        const from = this.visit.get(fromId);
        const to = this.visit.get(toId);
        if (from && to) {
            const fromOrder = from.order;
            const toOrder = to.order;
            from.order = toOrder;
            to.order = fromOrder;
            this.visit.set(from.id, from);
            this.visit.set(to.id, to);
        }
        this.swapBinding(fromId, toId);
    }

    swapBinding(fromId: number, toId: number) {
        const fromBinding = this.binding.get(fromId);
        const toBinding = this.binding.get(toId);
        if (fromBinding) {
            this.binding.set(toId, fromBinding)
        } else {
            this.binding.delete(toId);
        }
        if (toBinding) {
            this.binding.set(fromId, toBinding);
        } else {
            this.binding.delete(fromId);
        }
    }

    bind(parentId: number, childIds: number[]) {
        // check if parent id is valid
        if (this.mode === EventMode.FORM) {
            if (!this.form.has(parentId)) {
                return;
            }
        } else {
            if (!this.visit.has(parentId)) {
                return;
            }
        }
        this.binding.set(parentId, new Set(childIds));
    }

    switchBindingMode() {
        this.mode = this.mode === EventMode.FORM ? EventMode.VISIT : EventMode.FORM;
        this.binding = this.switchBinding();
    }

    switchBinding() {
        const newBinding = new Map<number, Set<number>>();
        this.binding.forEach((values, key) => {
            values.forEach(value => {
                const children = newBinding.get(value);
                if (!children) {
                    newBinding.set(value, new Set([key]));
                } else {
                    children.add(key);
                    newBinding.set(value, children);
                }
            })
        });
        return newBinding;
    }

    itemName(id: number) {
        if (this.mode === EventMode.VISIT) {
            const item = this.visit.get(id);
            return item ? item.name : "";
        }
        const item = this.form.get(id);
        return item ? item.name : "";
    }

    listItem() {
        if (this.mode === EventMode.VISIT) {
            return this.listVisit()
        }
        return this.listForm();
    }

    listVisit() {
        return Array.from(this.visit.values()).sort((x, y) => x.order - y.order).map((v) => {
            return {
                id: v.id,
                item: v.name,
            }
        });
    }

    listForm() {
        return Array.from(this.form.values()).sort((x, y) => x.order - y.order).map((v) => {
            return {
                id: v.id,
                item: v.name,
            }
        });
    }

    formDetail(id: number) {
        const form = this.form.get(id);
        const binding = this.binding.get(id);
        if (form) {
            const visit: Visit[] = [];
            if (binding) {
                Array.from(binding).forEach((vid) => {
                    const v = this.visit.get(vid);
                    if (v) {
                        visit.push({ id: v.id, name: v.name, order: v.order });
                    }
                })
            }
            visit.sort((x, y) => x.order - y.order);
            return { id: form.id, name: form.name, page: form.page, order: form.order, visit }
        }
        return null;
    }

    visitDetail(id: number) {
        const visit = this.visit.get(id);
        const binding = this.binding.get(id);
        if (visit) {
            const form: Form[] = [];
            if (binding) {
                Array.from(binding).forEach((fid) => {
                    const f = this.form.get(fid);
                    if (f) {
                        form.push({ id: f.id, name: f.name, page: f.page, order: f.order });
                    }
                })
            }
            form.sort((x, y) => x.order - y.order);
            return { id: visit.id, name: visit.name, order: visit.order, form }
        }
        return null;

    }

    preview() {
        let binding = this.mode === EventMode.FORM ? this.binding : this.switchBinding();
        const headers = Array.from(this.visit.values()).sort((x, y) => x.order - y.order).map(v => {
            return {
                id: v.id,
                field: `v${v.id}`,
                label: v.name,
            }
        });
        const rows = Array.from(this.form.values()).sort((x, y) => x.order - y.order).map(f => {
            let row: { id: number, label: string, [key: string]: any, } = { id: f.id, label: f.name };
            let visits = binding.get(f.id);
            if (visits) {
                headers.forEach(h => {
                    row[h.field] = visits?.has(h.id) ? true : false;
                });
            }
            return row;
        });

        return { headers, rows };
    }

    toRenderData(): RenderData {
        const form = Array.from(this.form.values()).sort((x, y) => x.order - y.order);
        const visit = Array.from(this.visit.values()).sort((x, y) => x.order - y.order);
        const binding = Array.from(
            this.mode === EventMode.FORM ? this.binding : this.switchBinding()
        ).map(([parent, children]) => {
            return {
                parent,
                children: Array.from(children),
            }
        });
        return { form, visit, binding };
    }
}

