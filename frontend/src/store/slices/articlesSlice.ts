import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Article, ArticleListItem, Pagination, ArticleListParams } from "@/lib/api/types";

interface ArticlesState {
    items: ArticleListItem[];
    current: Article | null;
    pagination: Pagination | null;
    adminItems: Article[];
    adminPagination: Pagination | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: ArticlesState = {
    items: [], current: null, pagination: null,
    adminItems: [], adminPagination: null,
    loading: false, saving: false, error: null,
};

const articlesSlice = createSlice({
    name: "articles",
    initialState,
    reducers: {
        fetchArticlesRequest: (state, _action: PayloadAction<ArticleListParams | undefined>) => { state.loading = true; state.error = null; },
        fetchArticlesSuccess: (state, action: PayloadAction<{ items: ArticleListItem[]; pagination: Pagination }>) => {
            state.items = action.payload.items; state.pagination = action.payload.pagination; state.loading = false;
        },
        fetchArticlesFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchArticleBySlugRequest: (state, _action: PayloadAction<string>) => { state.loading = true; state.error = null; },
        fetchArticleBySlugSuccess: (state, action: PayloadAction<Article>) => { state.current = action.payload; state.loading = false; },
        fetchArticleBySlugFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchAdminArticlesRequest: (state, _action: PayloadAction<(ArticleListParams & { status?: string }) | undefined>) => { state.loading = true; state.error = null; },
        fetchAdminArticlesSuccess: (state, action: PayloadAction<{ items: Article[]; pagination: Pagination }>) => {
            state.adminItems = action.payload.items; state.adminPagination = action.payload.pagination; state.loading = false;
        },
        fetchAdminArticlesFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        fetchAdminArticleByIdRequest: (state, _action: PayloadAction<string>) => { state.loading = true; state.error = null; },
        fetchAdminArticleByIdSuccess: (state, action: PayloadAction<Article>) => { state.current = action.payload; state.loading = false; },
        fetchAdminArticleByIdFailure: (state, action: PayloadAction<string>) => { state.loading = false; state.error = action.payload; },

        createArticleRequest: (state, _action: PayloadAction<Partial<Article> & { title: string; category: string; body: string; author: string }>) => { state.saving = true; state.error = null; },
        createArticleSuccess: (state, action: PayloadAction<Article>) => { state.current = action.payload; state.saving = false; },
        createArticleFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        updateArticleRequest: (state, _action: PayloadAction<{ id: string; data: Partial<Article> }>) => { state.saving = true; state.error = null; },
        updateArticleSuccess: (state, action: PayloadAction<Article>) => { state.current = action.payload; state.saving = false; },
        updateArticleFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        deleteArticleRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        deleteArticleSuccess: (state) => { state.current = null; state.saving = false; },
        deleteArticleFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        submitArticleRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        approveArticleRequest: (state, _action: PayloadAction<{ id: string; reviewNote?: string }>) => { state.saving = true; state.error = null; },
        rejectArticleRequest: (state, _action: PayloadAction<{ id: string; reviewNote: string }>) => { state.saving = true; state.error = null; },
        publishArticleRequest: (state, _action: PayloadAction<string>) => { state.saving = true; state.error = null; },
        articleWorkflowSuccess: (state, action: PayloadAction<Article | null>) => {
            if (action.payload) state.current = action.payload;
            state.saving = false;
        },
        articleWorkflowFailure: (state, action: PayloadAction<string>) => { state.saving = false; state.error = action.payload; },

        clearArticlesError: (state) => { state.error = null; },
        clearCurrentArticle: (state) => { state.current = null; },
    },
});

export const {
    fetchArticlesRequest, fetchArticlesSuccess, fetchArticlesFailure,
    fetchArticleBySlugRequest, fetchArticleBySlugSuccess, fetchArticleBySlugFailure,
    fetchAdminArticlesRequest, fetchAdminArticlesSuccess, fetchAdminArticlesFailure,
    fetchAdminArticleByIdRequest, fetchAdminArticleByIdSuccess, fetchAdminArticleByIdFailure,
    createArticleRequest, createArticleSuccess, createArticleFailure,
    updateArticleRequest, updateArticleSuccess, updateArticleFailure,
    deleteArticleRequest, deleteArticleSuccess, deleteArticleFailure,
    submitArticleRequest, approveArticleRequest, rejectArticleRequest,
    publishArticleRequest, articleWorkflowSuccess, articleWorkflowFailure,
    clearArticlesError, clearCurrentArticle,
} = articlesSlice.actions;
export default articlesSlice.reducer;
