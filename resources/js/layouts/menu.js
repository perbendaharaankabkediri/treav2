import {
    ArrowLeftRight,
    Banknote,
    BarChart3,
    Building2,
    FileUp,
    GitCompareArrows,
    HandCoins,
    LayoutDashboard,
    ListChecks,
    MonitorCheck,
    MonitorDot,
    ReceiptText,
    ScrollText,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Table2,
    Users,
    UserCog,
    WalletCards,
} from 'lucide-react';

export const navigation = [
    {
        label: 'Home',
        items: [
            {
                label: 'Dashboard',
                routeName: 'dashboard',
                permission: 'dashboard.view',
                icon: LayoutDashboard,
            },
        ],
    },
    {
        label: 'ICSA',
        items: [
            {
                label: 'Penerimaan',
                icon: HandCoins,
                permission: 'icsa-rekon.create',
                children: [
                    {
                        label: 'Rekonsiliasi',
                        icon: ArrowLeftRight,
                        development: true,
                    },
                    {
                        label: 'STBP',
                        icon: ReceiptText,
                        development: true,
                    },
                    {
                        label: 'STS',
                        icon: FileUp,
                        development: true,
                    },
                ],
            },
            {
                label: 'Pengeluaran',
                icon: WalletCards,
                children: [
                    {
                        label: 'Import Data',
                        icon: FileUp,
                        permission: 'icsa-rekon.create',
                        routeName: 'icsa.pengeluaran.import-data.index',
                    },
                    {
                        label: 'Rekonsiliasi',
                        routeName: 'icsa.pengeluaran.rekonsiliasi.index',
                        permission: 'icsa-rekon.view',
                        icon: ArrowLeftRight,
                    },
                    {
                        label: 'Rekap Data',
                        routeName: 'icsa.pengeluaran.rekap-data.index',
                        permission: 'icsa-rekap.view',
                        icon: Table2,
                    },
                    {
                        label: 'Rekap Monitoring',
                        routeName: 'icsa.pengeluaran.rekap-monitoring.index',
                        permission: 'icsa-rekap.view',
                        icon: BarChart3,
                    },
                ],
            },
        ],
    },
    {
        label: 'Kasda',
        items: [
            {
                label: 'Import Data',
                routeName: 'kasda.import.index',
                permission: 'kasda-import.execute',
                icon: FileUp,
            },
            {
                label: 'Saldo Awal',
                routeName: 'kasda.saldo-awal.index',
                permission: 'kasda-saldo-awal.view',
                icon: Banknote,
            },
            {
                label: 'Pencocokan Harian',
                routeName: 'kasda.pencocokan-harian.index',
                permission: 'kasda-matching.view',
                icon: MonitorCheck,
            },
            {
                label: 'Monitoring Periode',
                routeName: 'kasda.monitoring-periode.index',
                permission: 'kasda-monitoring.view',
                icon: MonitorDot,
            },
            {
                label: 'Transaksi Belum Cocok',
                routeName: 'kasda.transaksi-belum-cocok.index',
                permission: 'kasda-matching.view',
                icon: ListChecks,
            },
            {
                label: 'Rekonsiliasi Kasda',
                routeName: 'kasda.rekon.index',
                permission: 'kasda-rekon.view',
                icon: GitCompareArrows,
            },
        ],
    },
    {
        label: 'Administrasi',
        items: [
            {
                label: 'Dashboard Keamanan',
                routeName: 'administrasi.keamanan.index',
                permission: 'permissions.manage',
                icon: ShieldAlert,
            },
            {
                label: 'Manajemen Akun',
                routeName: 'administrasi.akun.index',
                permission: 'users.view',
                icon: UserCog,
            },
            {
                label: 'Role & Permission',
                routeName: 'administrasi.role-permission.index',
                permission: 'permissions.manage',
                icon: ShieldCheck,
            },
            {
                label: 'Log Aktivitas',
                routeName: 'administrasi.log-aktivitas.index',
                permission: 'activity-log.view',
                icon: ScrollText,
            },
        ],
    },
    {
        label: 'Master Data',
        items: [
            {
                label: 'SKPD',
                routeName: 'skpd.index',
                permission: 'skpd.view',
                icon: Building2,
            },
            {
                label: 'Bendahara',
                routeName: 'bendahara.index',
                permission: 'bendahara.view',
                icon: Users,
            },
            {
                label: 'BUD',
                routeName: 'bud.index',
                permission: 'bud.view',
                icon: Shield,
            },
        ],
    },
];
