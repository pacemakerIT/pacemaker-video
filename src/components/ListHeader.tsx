'use client';
import * as React from 'react';

export default function ListHeader() {
  return (
    <div className="w-full flex justify-center items-center h-96 bg-[linear-gradient(30deg,_#A8DBFF60_5%,_#FF823610_40%,_#A8DBFF40_50%)]">
      <div className="flex flex-col justify-center items-center gap-8">
        <span className="font-bold text-pace-4xl text-center whitespace-pre-line">
          {`북미 취업의 정석,\n 페이스 메이커 온라인 강의로 준비하세요.`}
        </span>
        <button className="bg-pace-orange-600 text-white px-8 py-4 rounded-full">
          {`강의 보러가기`}
        </button>
      </div>
    </div>
  );
}
