import React from 'react';

type Props = {
  title: string;
  listTitle?: React.ReactNode;
  onSave?: () => void;
  saveDisabled?: boolean;
  leftControls?: React.ReactNode;
  rightControls?: React.ReactNode;
  tableHeader?: React.ReactNode;
  children: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
};

export default function AdminListLayout({
  title,
  listTitle,
  onSave,
  saveDisabled = false,
  leftControls,
  rightControls,
  tableHeader,
  children,
  footerLeft,
  footerRight
}: Props) {
  return (
    <div className="p-10">
      <div className="flex justify-between pb-10">
        <h1 className="text-pace-3xl font-bold">{title}</h1>
        {onSave ? (
          <button
            onClick={onSave}
            disabled={saveDisabled}
            className="bg-pace-orange-800 text-pace-white-500 text-pace-lg w-[140px] h-[60px] rounded hover:bg-pace-orange-900 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            저장
          </button>
        ) : null}
      </div>

      <div>
        {listTitle}

        <div className="pt-6 pb-6 flex items-center justify-between">
          <div>{leftControls}</div>
          <div>{rightControls}</div>
        </div>

        <div className="w-full pb-7">
          {tableHeader}

          {children}
        </div>

        <div className="flex items-center justify-between pb-6">
          <div>{footerLeft}</div>
          <div className="flex items-center gap-2">{footerRight}</div>
        </div>
      </div>
    </div>
  );
}
