import { Form, Visit, Binding, } from "../../../api/reflector/reflector";

export enum EventMode {
    VISIT = "Visit",
    FORM = "Form",
}

export class Event {
    form: Map<number, Form>
    visit: Map<number, Visit>
    binding: Map<number, Set<number>>
    mode: EventMode
    constructor(form: Form[], visit: Visit[], binding: Binding[], mode: EventMode) {
        this.form = new Map(form.map(f => [f.id, f]));
        this.visit = new Map(visit.map(v => [v.id, v]));
        this.binding = new Map(binding.map(b => [b.parent, new Set(b.children)]));
        this.mode = mode;
    }

    addForm(form: Form) {
        this.form.set(form.id, form);
    }

    addVisit(visit: Visit) {
        this.visit.set(visit.id, visit);
    }

    updateForm(form: Form) {
        const id = form.id;
        this.form.set(id, form);
    }

    removeItem(id: number) {
        if (this.mode === EventMode.FORM) {
            this.form.delete(id);
        } else {
            this.visit.delete(id);
        }
        this.binding.delete(id);
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
            from.id = toId;
            to.id = fromId;
            this.form.set(fromId, to);
            this.form.set(toId, from);
        }
    }

    swapVisit(fromId: number, toId: number) {
        const from = this.visit.get(fromId);
        const to = this.visit.get(toId);
        if (from && to) {
            from.id = toId;
            to.id = fromId;
            this.visit.set(fromId, to);
            this.visit.set(toId, from);
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
        return Array.from(this.visit.values()).sort((x, y) => x.id - y.id).map((v) => {
            return {
                id: v.id,
                item: v.name,
            }
        });
    }

    listForm() {
        return Array.from(this.form.values()).sort((x, y) => x.id - y.id).map((v) => {
            return {
                id: v.id,
                item: v.name,
            }
        });
    }

    formDetail(id: number) {
        const form = this.form.get(id);
        const binding = this.binding.get(id);
        if (!form || !binding) {
            return null;
        }
        const visit: Visit[] = [];
        Array.from(binding).sort((x, y) => x - y).forEach((vid) => {
            const v = this.visit.get(vid);
            if (v) {
                visit.push({ id: v.id, name: v.name });
            }
        })
        return { id: form.id, name: form.name, page: form.page, visit }
    }

    visitDetail(id: number) {
        const visit = this.visit.get(id);
        const binding = this.binding.get(id);
        if (!visit || !binding) {
            return null;
        }
        const form: Form[] = [];
        Array.from(binding).sort((x, y) => x - y).forEach((fid) => {
            const f = this.form.get(fid);
            if (f) {
                form.push({ id: f.id, name: f.name, page: f.page });
            }
        })
        return { id: visit.id, name: visit.name, form }
    }

    preview() {
        let binding = this.mode === EventMode.FORM ? this.binding : this.switchBinding();
        const headers = Array.from(this.visit.values()).sort((x, y) => x.id - y.id).map(v => {
            return {
                id: v.id,
                field: `v${v.id}`,
                label: v.name,
            }
        });
        const rows = Array.from(this.form.values()).sort((x, y) => x.id - y.id).map(f => {
            let row: { id: number, label: string, [key: string]: any, } = { id: f.id, label: f.name };
            let visits = binding.get(f.id);
            if (visits) {
                headers.forEach(h => {
                    row[h.field] = visits.has(h.id) ? true : false;
                });
            }
            return row;
        });

        return { headers, rows };
    }
}

