import { call, put, takeLatest } from "redux-saga/effects";
import {
    getArticles, getArticleBySlugSafe, getAdminArticles, getAdminArticleById,
    createArticle as apiCreate, updateArticle as apiUpdate, deleteArticle as apiDelete,
    submitArticle as apiSubmit, approveArticle as apiApprove,
    rejectArticle as apiReject, publishArticle as apiPublish,
} from "@/lib/api";
import {
    fetchArticlesRequest, fetchArticlesSuccess, fetchArticlesFailure,
    fetchArticleBySlugRequest, fetchArticleBySlugSuccess, fetchArticleBySlugFailure,
    fetchAdminArticlesRequest, fetchAdminArticlesSuccess, fetchAdminArticlesFailure,
    fetchAdminArticleByIdRequest, fetchAdminArticleByIdSuccess, fetchAdminArticleByIdFailure,
    createArticleRequest, createArticleSuccess, createArticleFailure,
    updateArticleRequest, updateArticleSuccess, updateArticleFailure,
    deleteArticleRequest, deleteArticleSuccess, deleteArticleFailure,
    submitArticleRequest, approveArticleRequest, rejectArticleRequest,
    publishArticleRequest, articleWorkflowSuccess, articleWorkflowFailure,
} from "../slices/articlesSlice";
import type { Article, ArticleListItem, PagedResponse } from "@/lib/api/types";

const errMsg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

function* fetchListSaga(action: ReturnType<typeof fetchArticlesRequest>): Generator {
    try {
        const data = (yield call(getArticles, action.payload)) as PagedResponse<ArticleListItem>;
        yield put(fetchArticlesSuccess(data));
    } catch (e) { yield put(fetchArticlesFailure(errMsg(e, "Failed to load articles"))); }
}

function* fetchBySlugSaga(action: ReturnType<typeof fetchArticleBySlugRequest>): Generator {
    try {
        // Uses safe variant — treats 500 as not found (known backend bug)
        const data = (yield call(getArticleBySlugSafe, action.payload)) as Article | null;
        if (!data) { yield put(fetchArticleBySlugFailure("Article not found")); return; }
        yield put(fetchArticleBySlugSuccess(data));
    } catch (e) { yield put(fetchArticleBySlugFailure(errMsg(e, "Article not found"))); }
}

function* fetchAdminListSaga(action: ReturnType<typeof fetchAdminArticlesRequest>): Generator {
    try {
        const data = (yield call(getAdminArticles, action.payload)) as PagedResponse<Article>;
        yield put(fetchAdminArticlesSuccess(data));
    } catch (e) { yield put(fetchAdminArticlesFailure(errMsg(e, "Failed to load articles"))); }
}

function* fetchAdminByIdSaga(action: ReturnType<typeof fetchAdminArticleByIdRequest>): Generator {
    try {
        const data = (yield call(getAdminArticleById, action.payload)) as Article;
        yield put(fetchAdminArticleByIdSuccess(data));
    } catch (e) { yield put(fetchAdminArticleByIdFailure(errMsg(e, "Article not found"))); }
}

function* createSaga(action: ReturnType<typeof createArticleRequest>): Generator {
    try {
        const data = (yield call(apiCreate, action.payload)) as Article;
        yield put(createArticleSuccess(data));
    } catch (e) { yield put(createArticleFailure(errMsg(e, "Failed to create article"))); }
}

function* updateSaga(action: ReturnType<typeof updateArticleRequest>): Generator {
    try {
        const data = (yield call(apiUpdate, action.payload.id, action.payload.data)) as Article;
        yield put(updateArticleSuccess(data));
    } catch (e) { yield put(updateArticleFailure(errMsg(e, "Failed to update article"))); }
}

function* deleteSaga(action: ReturnType<typeof deleteArticleRequest>): Generator {
    try {
        yield call(apiDelete, action.payload);
        yield put(deleteArticleSuccess());
    } catch (e) { yield put(deleteArticleFailure(errMsg(e, "Failed to delete article"))); }
}

function* workflowSaga(apiFn: (id: string, note?: string) => Promise<unknown>, id: string, note?: string): Generator {
    try {
        yield call(apiFn, id, note);
        const updated = (yield call(getAdminArticleById, id)) as Article;
        yield put(articleWorkflowSuccess(updated));
    } catch (e) { yield put(articleWorkflowFailure(errMsg(e, "Workflow action failed"))); }
}

function* submitSaga(action: ReturnType<typeof submitArticleRequest>): Generator { yield* workflowSaga(apiSubmit, action.payload); }
function* approveSaga(action: ReturnType<typeof approveArticleRequest>): Generator { yield* workflowSaga(apiApprove, action.payload.id, action.payload.reviewNote); }
function* rejectSaga(action: ReturnType<typeof rejectArticleRequest>): Generator {
    try {
        yield call(apiReject, action.payload.id, action.payload.reviewNote);
        const updated = (yield call(getAdminArticleById, action.payload.id)) as Article;
        yield put(articleWorkflowSuccess(updated));
    } catch (e) { yield put(articleWorkflowFailure(errMsg(e, "Reject failed"))); }
}
function* publishSaga(action: ReturnType<typeof publishArticleRequest>): Generator { yield* workflowSaga(apiPublish, action.payload); }

export default function* articlesSaga() {
    yield takeLatest(fetchArticlesRequest.type, fetchListSaga);
    yield takeLatest(fetchArticleBySlugRequest.type, fetchBySlugSaga);
    yield takeLatest(fetchAdminArticlesRequest.type, fetchAdminListSaga);
    yield takeLatest(fetchAdminArticleByIdRequest.type, fetchAdminByIdSaga);
    yield takeLatest(createArticleRequest.type, createSaga);
    yield takeLatest(updateArticleRequest.type, updateSaga);
    yield takeLatest(deleteArticleRequest.type, deleteSaga);
    yield takeLatest(submitArticleRequest.type, submitSaga);
    yield takeLatest(approveArticleRequest.type, approveSaga);
    yield takeLatest(rejectArticleRequest.type, rejectSaga);
    yield takeLatest(publishArticleRequest.type, publishSaga);
}
