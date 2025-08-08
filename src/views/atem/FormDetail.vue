<script lang="ts" setup>
import FormCard from './FormCard.vue';
import ItemCard from './ItemCard.vue';
import { onMounted, onUpdated, Ref, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { ElLoading } from 'element-plus';
import type { ScrollbarInstance } from 'element-plus';
import { debounce } from 'lodash';
import { ItemAnnotation } from './utils/interfaces';
import { useAtem } from '../../store/atem';
import { listDomainByForm } from '../../api/atem/annotation/apis/domain';
import { FormInfo, getFormById, listItems } from '../../api/atem/rawdata/apis/rawdata';
import { Annotation } from '../../api/atem/annotation/interfaces/annotation';
import { listAnnotationByForm } from '../../api/atem/annotation/apis/annotation';
import { buildFormAnnotation, buildItemsAnnotation, loglineTracing } from './utils/helper';

const store = useAtem();
const { activeFormId, activeFormDomains, activeAnnoationVersionId, domainOrder, scrollValue, loglineTracer } = storeToRefs(store);
const form: Ref<FormInfo | null> = ref(null);
const items: Ref<ItemAnnotation[]> = ref([]);
const formAnnotations: Ref<Annotation[]> = ref([]);
const key = ref(0);
const scrollbarRef = ref<ScrollbarInstance>();
const scrollTopValue = ref(0);

function scroll({ scrollTop }: { scrollLeft: number, scrollTop: number }) {
    scrollTopValue.value = scrollTop;
}

async function getFormDetail() {
    if (!activeFormId.value) {
        return;
    }
    const loadingInstance = ElLoading.service({ fullscreen: false, target: ".item-area", text: "loading" });
    const itemList = await listItems(activeFormId.value);
    const formId = activeFormId.value;
    const annotationVersionId = activeAnnoationVersionId.value;
    const annotations = activeAnnoationVersionId.value ? await listAnnotationByForm({ formId, annotationVersionId }) : undefined;
    activeFormDomains.value = await listDomainByForm({ formId, annotationVersionId });
    domainOrder.value = new Map(activeFormDomains.value.map((domain, index) => [domain.id, index])) as Map<number, number>;
    items.value = buildItemsAnnotation(itemList, annotations);
    loglineTracer.value = loglineTracing(items.value);
    formAnnotations.value = buildFormAnnotation(annotations);
    loadingInstance.close();
    key.value++;
}

onMounted(async () => {
    if (!activeFormId.value) {
        form.value = null;
        items.value = [];
        return;
    }
    form.value = await getFormById(activeFormId.value);
    scrollValue.value = 0;
    activeFormDomains.value = await listDomainByForm({ formId: activeFormId.value, annotationVersionId: activeAnnoationVersionId.value });
    if (form.value) {
        await getFormDetail();
    }
});

onUpdated(() => {
    scrollbarRef.value!.setScrollTop(scrollValue.value);
});

watch(() => scrollTopValue.value, debounce(() => {
    scrollValue.value = scrollTopValue.value;
}, 500));

watch(() => activeFormId.value, async () => {
    if (!activeFormId.value) {
        form.value = null;
        items.value = [];
        return;
    }
    form.value = await getFormById(activeFormId.value);
    scrollValue.value = 0;
    activeFormDomains.value = await listDomainByForm({ formId: activeFormId.value, annotationVersionId: activeAnnoationVersionId.value });
    if (form.value) {
        await getFormDetail();
    }
})

watch(() => activeAnnoationVersionId.value, async () => {
    if (!activeFormId.value) {
        form.value = null;
        items.value = [];
        return;
    }
    activeFormDomains.value = await listDomainByForm({ formId: activeFormId.value, annotationVersionId: activeAnnoationVersionId.value });
    if (form.value) {
        await getFormDetail();
    }
});

</script>

<template>
    <el-scrollbar ref="scrollbarRef" :key="key" max-height="600" @scroll="scroll">
        <div class="item-area">
            <FormCard @change="getFormDetail" v-if="form" :form="form" :form-annotations="formAnnotations" />
            <ItemCard @change="getFormDetail" v-for="item in items" :item="item" />
        </div>
    </el-scrollbar>
</template>
