"use client";

export function ConfirmButton({children,message="Are you sure?",className=""}:{children:React.ReactNode;message?:string;className?:string}) {
  return <button type="submit" className={className} onClick={(event)=>{if(!window.confirm(message))event.preventDefault();}}>{children}</button>;
}
