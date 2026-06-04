'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto flex min-h-full items-end sm:items-center justify-center p-4">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-4 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:scale-95">
            <Dialog.Panel className={`w-full ${maxW} bg-white rounded-2xl p-6`} style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
              <div className="flex items-center justify-between mb-5">
                <Dialog.Title className="text-lg font-bold text-[#3B2F2F]">{title}</Dialog.Title>
                <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[#7A6B6B] hover:bg-orange-100 hover:text-[#D4764E] transition-colors">
                  <X size={16} />
                </button>
              </div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
