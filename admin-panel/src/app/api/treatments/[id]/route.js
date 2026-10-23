import { proxy } from '@/lib/apiProxy';
export async function GET(req, { params }) { const { id } = await params; return proxy(req, `/api/admin/treatments/${id}`); }
export async function PUT(req, { params }) { const { id } = await params; return proxy(req, `/api/admin/treatments/${id}`); }
export async function DELETE(req, { params }) { const { id } = await params; return proxy(req, `/api/admin/treatments/${id}`); }
