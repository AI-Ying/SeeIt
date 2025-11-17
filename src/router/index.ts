import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
  },
  {
    path: '/items',
    name: 'Items',
    component: () => import('@/pages/Items.vue'),
  },
  {
    path: '/add',
    name: 'AddItem',
    component: () => import('@/pages/AddItem.vue'),
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/Search.vue'),
  },
  {
    path: '/insights',
    name: 'Insights',
    component: () => import('@/pages/Insights.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Profile.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue'),
  },
  {
    path: '/ai-test',
    name: 'AICategoryTest',
    component: () => import('@/pages/AICategoryTest.vue'),
  },
  {
    path: '/test-upload',
    name: 'TestUpload',
    component: () => import('@/pages/TestUpload.vue'),
  },
  {
    path: '/simple-upload-test',
    name: 'SimpleUploadTest',
    component: () => import('@/pages/SimpleUploadTest.vue'),
  },
  {
    path: '/storage-diagnostic',
    name: 'StorageDiagnostic',
    component: () => import('@/pages/StorageDiagnostic.vue'),
  },
  {
    path: '/direct-upload-test',
    name: 'DirectUploadTest',
    component: () => import('@/pages/DirectUploadTest.vue'),
  },
  {
    path: '/upload-verification',
    name: 'UploadVerification',
    component: () => import('@/pages/UploadVerification.vue'),
  },
  {
    path: '/bucket-status',
    name: 'BucketStatus',
    component: () => import('@/pages/BucketStatus.vue'),
  },
  {
    path: '/bucket-creation-test',
    name: 'BucketCreationTest',
    component: () => import('@/pages/BucketCreationTest.vue'),
  },
  {
    path: '/save-function-test',
    name: 'SaveFunctionTest',
    component: () => import('@/pages/SaveFunctionTest.vue'),
  },
  {
    path: '/simple-save-test',
    name: 'SimpleSaveTest',
    component: () => import('@/pages/SimpleSaveTest.vue'),
  },
  {
    path: '/debug-save-error',
    name: 'DebugSaveError',
    component: () => import('@/pages/DebugSaveError.vue'),
  },
  {
    path: '/direct-database-test',
    name: 'DirectDatabaseTest',
    component: () => import('@/pages/DirectDatabaseTest.vue'),
  },
  {
    path: '/simple-add-item',
    name: 'SimpleAddItem',
    component: () => import('@/pages/SimpleAddItem.vue'),
  },
  {
    path: '/item/:id',
    name: 'ItemDetail',
    component: () => import('@/pages/ItemDetail.vue'),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;