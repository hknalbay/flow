(*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *)

open Base

let entry =
  WorkerController.register_entry_point ~restore:(fun _ ~(worker_id : int) ->
      Hh_logger.set_id (Printf.sprintf "procs_test_utils %d" worker_id)
  )

let try_finalize f x finally y =
  let res =
    try f x with
    | exn ->
      finally y;
      raise exn
  in
  finally y;
  res

let make_workers n =
  let worker_mode =
    if Sys.win32 then
      Worker.Spawned
    else
      Worker.Prespawned_should_fork
  in
  let default_sharedmem_config =
    let gig = 1024 * 1024 * 1024 in
    { SharedMem.heap_size = 20 * gig; hash_table_pow = 18 }
  in
  let heap_handle =
    match SharedMem.init ~num_workers:n default_sharedmem_config with
    | Ok handle -> handle
    | Error () -> raise SharedMem.Out_of_shared_memory
  in
  let gc_control = Caml.Gc.get () in
  let workers =
    MultiWorkerLwt.make
      ~worker_mode
      ~channel_mode:`pipe
      ~saved_state:()
      ~entry
      ~nbr_procs:n
      ~gc_control
      ~heap_handle
  in
  workers

let cleanup () = WorkerController.killall ()

let run_interrupter limit =
  let (fd_in, fd_out) = Unix.pipe () in
  let interrupter_pid =
    match Unix.fork () with
    | 0 ->
      Unix.close fd_in;
      let rec aux x =
        match x with
        | Some 0 -> Caml.exit 0
        | _ ->
          let written = Unix.write_substring fd_out "!" 0 1 in
          assert (written = 1);
          aux (Base.Option.map x ~f:(fun x -> x - 1))
      in
      aux limit
    | pid -> pid
  in
  Unix.close fd_out;
  (fd_in, interrupter_pid)

let read_exclamation_mark fd =
  let exclamation_mark = Bytes.create 1 in
  let read = Unix.read fd exclamation_mark 0 1 in
  assert (read = 1 && String.equal (Bytes.to_string exclamation_mark) "!")
