<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $this->validatedFilters($request);
        $visibleLogs = $this->visibleQuery($request);
        $query = $this->filteredQuery(clone $visibleLogs, $filters)->latest();

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $query->paginate(25)->withQueryString(),
            'filters' => $filters,
            'options' => [
                'actions' => (clone $visibleLogs)->distinct()->orderBy('action')->pluck('action'),
                'modules' => (clone $visibleLogs)->distinct()->orderBy('module')->pluck('module'),
                'roles' => (clone $visibleLogs)->whereNotNull('role_name')->distinct()->orderBy('role_name')->pluck('role_name'),
                'users' => User::query()
                    ->when($request->user()->hasRole('admin'), fn (Builder $query) => $query->role('operator'))
                    ->orderBy('name')->get(['id', 'name']),
            ],
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->validatedFilters($request);
        $query = $this->filteredQuery($this->visibleQuery($request), $filters)->oldest();
        $filename = 'activity-logs-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Waktu', 'Pengguna', 'Role', 'Modul', 'Aksi', 'Status', 'Kode SKPD', 'Tahun', 'Deskripsi', 'Request ID']);

            $query->chunkById(500, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        $log->created_at?->format('Y-m-d H:i:s'),
                        $log->user_name,
                        $log->role_name,
                        $log->module,
                        $log->action,
                        $log->status,
                        $log->kode_skpd,
                        $log->tahun,
                        $log->description,
                        $log->request_id,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function validatedFilters(Request $request): array
    {
        return $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'action' => ['nullable', 'string', 'max:100'],
            'module' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:success,failed'],
            'user_id' => ['nullable', 'integer'],
            'kode_skpd' => ['nullable', 'string', 'max:50'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);
    }

    private function visibleQuery(Request $request): Builder
    {
        return ActivityLog::query()
            ->when($request->user()->hasRole('admin'), fn (Builder $query) => $query
                ->where('module', '!=', 'authorization')
                ->where(fn (Builder $query) => $query->whereNull('role_name')->orWhere('role_name', '!=', 'superadmin')));
    }

    private function filteredQuery(Builder $query, array $filters): Builder
    {
        foreach (['action', 'module', 'role_name' => 'role', 'status', 'user_id', 'kode_skpd'] as $column => $filter) {
            if (is_int($column)) {
                $column = $filter;
            }
            $query->when($filters[$filter] ?? null, fn (Builder $query, $value) => $query->where($column, $value));
        }

        return $query
            ->when($filters['search'] ?? null, function (Builder $query, $search) {
                $keyword = '%'.mb_strtolower($search).'%';
                $query->where(fn (Builder $query) => $query
                    ->whereRaw('LOWER(description) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(CAST(request_id AS TEXT)) LIKE ?', [$keyword])
                    ->orWhereRaw('LOWER(user_name) LIKE ?', [$keyword]));
            })
            ->when($filters['date_from'] ?? null, fn (Builder $query, $value) => $query->whereDate('created_at', '>=', $value))
            ->when($filters['date_to'] ?? null, fn (Builder $query, $value) => $query->whereDate('created_at', '<=', $value));
    }
}
