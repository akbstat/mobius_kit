import { Form, Visit, Binding, } from "../../../api/reflector/reflector";

export enum EventMode {
    VISIT,
    FORM,
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

    bind(parent_id: number, child_id: number) {
        // check if parent id is valid
        if (this.mode === EventMode.FORM) {
            if (!this.form.has(parent_id)) {
                return;
            }
        } else {
            if (!this.visit.has(parent_id)) {
                return;
            }
        }
        let children = this.binding.get(parent_id);
        if (!children) {
            this.binding.set(parent_id, new Set([child_id]));
        } else {
            children.add(child_id);
            this.binding.set(parent_id, children);
        }
    }

    switchBindingMode() {
        this.mode = this.mode === EventMode.FORM ? EventMode.VISIT : EventMode.FORM;
        const newBinding = new Map<number, Set<number>>();
        this.binding.forEach((values, key) => {
            values.forEach(value => {
                const children = newBinding.get(key);
                if (!children) {
                    newBinding.set(key, new Set([key]))
                } else {
                    children.add(key)
                }
            })
        });
        this.binding = newBinding;
    }
}

